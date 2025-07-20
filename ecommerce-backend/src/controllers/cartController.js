
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price imageUrl stock isActive');

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                data: { cart: { items: [], totalAmount: 0 } }
            });
        }

        res.status(200).json({
            success: true,
            message: "Cart retrieved successfully",
            data: { cart }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve cart",
            error: error.message
        });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user._id;

        // Validate product
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found or unavailable"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock available"
            });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            // Create new cart
            cart = new Cart({
                user: userId,
                items: [{
                    product: productId,
                    quantity,
                    priceAtTime: product.price
                }]
            });
        } else {
            // Check if product already exists in cart
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                // Update existing item quantity
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;
                
                if (product.stock < newQuantity) {
                    return res.status(400).json({
                        success: false,
                        message: "Insufficient stock for requested quantity"
                    });
                }

                cart.items[existingItemIndex].quantity = newQuantity;
                cart.items[existingItemIndex].priceAtTime = product.price;
            } else {
                // Add new item to cart
                cart.items.push({
                    product: productId,
                    quantity,
                    priceAtTime: product.price
                });
            }
        }

        await cart.save();

        // Populate the cart for response
        await cart.populate('items.product', 'name price imageUrl stock');

        res.status(200).json({
            success: true,
            message: "Product added to cart successfully",
            data: { cart }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add product to cart",
            error: error.message
        });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user._id;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
            });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        // Validate stock
        const product = await Product.findById(productId);
        if (!product || product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient stock available"
            });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].priceAtTime = product.price;

        await cart.save();
        await cart.populate('items.product', 'name price imageUrl stock');

        res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: { cart }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update cart item",
            error: error.message
        });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.product', 'name price imageUrl stock');

        res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            data: { cart }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to remove product from cart",
            error: error.message
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { 
                items: [], 
                totalAmount: 0,
                discountAmount: 0,
                discountPercentage: 0,
                couponCode: null
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            data: { cart }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to clear cart",
            error: error.message
        });
    }
};

export const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        const userId = req.user._id;

        // This is a simplified coupon system
        // In a real application, you would have a Coupon model
        const validCoupons = {
            'SAVE10': { percentage: 10, description: '10% off' },
            'SAVE20': { percentage: 20, description: '20% off' },
            'WELCOME': { percentage: 15, description: '15% off for new customers' }
        };

        if (!validCoupons[couponCode]) {
            return res.status(400).json({
                success: false,
                message: "Invalid coupon code"
            });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        cart.couponCode = couponCode;
        cart.discountPercentage = validCoupons[couponCode].percentage;
        cart.discountAmount = 0; // Reset fixed discount when applying percentage discount

        await cart.save();
        await cart.populate('items.product', 'name price imageUrl stock');

        res.status(200).json({
            success: true,
            message: `Coupon applied successfully! ${validCoupons[couponCode].description}`,
            data: { cart }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to apply coupon",
            error: error.message
        });
    }
};

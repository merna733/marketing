
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { shippingAddress, notes } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Validate stock for all items
        const orderItems = [];
        for (const item of cart.items) {
            const product = item.product;
            
            if (!product || !product.isActive) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product?.name || 'Unknown'} is no longer available`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }

            orderItems.push({
                product: product._id,
                productName: product.name,
                quantity: item.quantity,
                priceAtTime: item.priceAtTime
            });
        }

        // Create order
        const order = new Order({
            user: userId,
            items: orderItems,
            totalAmount: cart.totalAmount,
            shippingAddress,
            notes
        });

        await order.save();

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Clear cart
        await Cart.findOneAndUpdate(
            { user: userId },
            { 
                items: [], 
                totalAmount: 0,
                discountAmount: 0,
                discountPercentage: 0,
                couponCode: null
            }
        );

        // Populate order for response
        await order.populate('items.product', 'name imageUrl');

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const filter = { user: userId };
        if (status) filter.status = status;

        const orders = await Order.find(filter)
            .populate('items.product', 'name imageUrl')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalOrders: total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve orders",
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ 
            _id: orderId, 
            user: userId 
        }).populate('items.product', 'name imageUrl');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order retrieved successfully",
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve order",
            error: error.message
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            paymentStatus,
            startDate,
            endDate
        } = req.query;

        const filter = {};
        
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('items.product', 'name imageUrl')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "All orders retrieved successfully",
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalOrders: total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve orders",
            error: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, paymentStatus } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true, runValidators: true }
        ).populate('items.product', 'name imageUrl');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order updated successfully",
            data: { order }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update order",
            error: error.message
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        // Find order
        const order = await Order.findOne({ 
            _id: orderId, 
            user: userId 
        }).populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Check if order can be cancelled
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`
            });
        }

        // Update order status
        order.status = 'cancelled';
        await order.save();

        // Restore product stock
        for (const item of order.items) {
            if (item.product) {
                await Product.findByIdAndUpdate(
                    item.product._id,
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: { order }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to cancel order",
            error: error.message
        });
    }
};

export const getOrderStats = async (req, res) => {
    try {
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    avgOrderValue: { $avg: "$totalAmount" }
                }
            }
        ]);

        const statusStats = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Order statistics retrieved successfully",
            data: {
                overall: stats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
                byStatus: statusStats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve order statistics",
            error: error.message
        });
    }
};

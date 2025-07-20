import orderModel from "../../../db/models/orderModel.js";
import cartModel from "../../../db/models/cartModel.js";

export const createOrder = async (req, res) => {
    try {
        const cart = await cartModel
            .findOne({ user: req.user._id })
            .populate("items.perfume");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const orderPerfumes = [];
        for (const item of cart.items) {
            const perfume = item.perfume;
            const quantityOrdered = item.quantity;

            if (perfume.stock < quantityOrdered) {
                return res.status(400).json({
                    message: `Not enough stock for ${perfume.name}`,
                });
            }

            perfume.stock -= quantityOrdered;
            await perfume.save();

            orderPerfumes.push({
                perfume: perfume._id,
                quantity: quantityOrdered,
            });
        }

        const totalPrice = cart.totalPrice;

        const order = await orderModel.create({
            user: req.user._id,
            perfumes: orderPerfumes,
            totalPrice,
        });

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (err) {
        res.status(500).json({
            message: "Failed to place order",
            error: err.message,
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ user: req.user._id })
            .populate("perfumes.perfume");

        res.json({ message: "Your orders", orders });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: err.message,
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find()
            .populate("perfumes.perfume")
            .populate("user");

        res.json({ message: "All orders", orders });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch all orders",
            error: err.message,
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await orderModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order status updated", order });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update order",
            error: err.message,
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        console.log(`🔄 User ${userId} attempting to cancel order ${id}`);

        // Find the order and check if it belongs to the user
        const order = await orderModel.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if the order belongs to the requesting user
        if (order.user.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ message: "You can only cancel your own orders" });
        }

        // Check if order can be cancelled (only pending orders)
        if (order.status !== "pending") {
            return res.status(400).json({
                message: `Cannot cancel order. Current status: ${order.status}. Only pending orders can be cancelled.`,
            });
        }

        // Update order status to cancelled
        order.status = "cancelled";
        await order.save();

        // Optional: Restore perfume stock when order is cancelled
        for (const item of order.perfumes) {
            await perfumeModel.findByIdAndUpdate(item.perfume, {
                $inc: { stock: item.quantity },
            });
        }

        console.log(`✅ Order ${id} cancelled successfully`);

        res.json({
            message: "Order cancelled successfully",
            order,
        });
    } catch (err) {
        console.error("❌ Error cancelling order:", err);
        res.status(500).json({
            message: "Failed to cancel order",
            error: err.message,
        });
    }
};

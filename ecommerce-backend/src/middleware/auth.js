
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "ecommerce_jwt_secret_key";

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ 
                success: false,
                message: "Access token required" 
            });
        }

        const token = authHeader.split(" ")[1];
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid or expired token" 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false,
            message: "Invalid token" 
        });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ 
            success: false,
            message: "Admin access required" 
        });
    }
    next();
};

export const requireOwnershipOrAdmin = (req, res, next) => {
    const userId = req.user._id.toString();
    const targetUserId = req.params.userId || req.params.id;

    if (req.user.role === "admin" || userId === targetUserId) {
        return next();
    }

    return res.status(403).json({ 
        success: false,
        message: "Access denied. You can only access your own resources." 
    });
};

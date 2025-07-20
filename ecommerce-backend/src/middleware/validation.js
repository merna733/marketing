
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const validateEmailAvailability = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: "Email is required" 
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            return res.status(409).json({ 
                success: false,
                message: "Email already registered. Please use a different email or login." 
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: "Error validating email availability" 
        });
    }
};

export const hashPassword = async (req, res, next) => {
    try {
        if (req.body.password) {
            const saltRounds = 12;
            req.body.password = await bcrypt.hash(req.body.password, saltRounds);
        }
        next();
    } catch (error) {
        return res.status(500).json({ 
            success: false,
            message: "Error processing password" 
        });
    }
};

export const validateRequiredFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = [];
        
        for (const field of requiredFields) {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}` 
            });
        }

        next();
    };
};

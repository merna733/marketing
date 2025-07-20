import userModel from "../../../db/models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        const user = await userModel.create(req.body);
        user.password = undefined;
        res.status(201).json({ message: "User created", user });
    } catch (err) {
        res.status(500).json({ message: "Signup failed", error: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const matched = bcrypt.compareSync(req.body.password, user.password);
        if (!matched) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, "key", {
            expiresIn: "7d",
        });

        res.status(200).json({ message: `Welcome ${user.name}`, token });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        res.json({ message: "All users", users });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: err.message,
        });
    }
};

export const updateOwnProfile = async (req, res) => {
    try {
        const id = req.user._id;

        if (req.body.password) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
        }

        const updatedUser = await userModel.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        updatedUser.password = undefined;
        res.json({ message: "Profile updated", updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};

export const updateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.body.password) {
            req.body.password = bcrypt.hashSync(req.body.password, 8);
        }

        const updatedUser = await userModel.findByIdAndUpdate(id, req.body, {
            new: true,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        updatedUser.password = undefined;
        res.json({ message: "User updated", updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await userModel.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed", error: err.message });
    }
};

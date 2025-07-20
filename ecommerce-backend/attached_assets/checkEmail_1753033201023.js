import userModel from "../../db/models/userModel.js";
import bcrypt from "bcrypt";

export const checkEmail = async (req, res, next) => {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
        return res
            .status(409)
            .json({ message: "Email already exists, please login" });
    }

    req.body.password = bcrypt.hashSync(req.body.password, 8);
    next();
};

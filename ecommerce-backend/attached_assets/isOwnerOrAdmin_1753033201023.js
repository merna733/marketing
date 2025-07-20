export const isOwnerOrAdmin = (req, res, next) => {
    const userId = req.user._id;
    const targetId = req.params.id;

    if (req.user.role === "admin" || userId === targetId) {
        return next();
    }

    return res.status(403).json({ message: "Not allowed" });
};

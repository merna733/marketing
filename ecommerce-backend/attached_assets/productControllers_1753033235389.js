import perfumeModel from "../../../db/models/perfumeModel.js";

export const addPerfume = async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const { price, stock, description, image, fragrance } = req.body;

        const existingPerfume = await perfumeModel.findOne({ name });

        if (existingPerfume) {
            existingPerfume.stock += stock ?? 1;
            if (price !== undefined) existingPerfume.price = price;
            if (description !== undefined)
                existingPerfume.description = description;
            if (image !== undefined) existingPerfume.image = image;
            if (fragrance !== undefined) existingPerfume.fragrance = fragrance;

            await existingPerfume.save();

            return res.status(200).json({
                message: "Perfume already exists, stock updated",
                perfume: existingPerfume,
            });
        }

        const newPerfume = await perfumeModel.create({
            name,
            price,
            stock,
            description,
            image,
            fragrance,
        });

        res.status(201).json({
            message: "New perfume added",
            perfume: newPerfume,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to add perfume",
            error: err.message,
        });
    }
};

export const getAllPerfumes = async (req, res) => {
    try {
        const perfumes = await perfumeModel.find();
        res.json({ message: "All perfumes", perfumes });
    } catch (err) {
        res.status(500).json({
            message: "Failed to get perfumes",
            error: err.message,
        });
    }
};

export const getPerfumeById = async (req, res) => {
    try {
        const { id } = req.params;
        const perfume = await perfumeModel.findById(id);
        if (!perfume) {
            return res.status(404).json({ message: "Perfume not found" });
        }
        res.json({ message: "Perfume fetched", perfume });
    } catch (err) {
        res.status(500).json({
            message: "Failed to get perfume",
            error: err.message,
        });
    }
};

export const updatePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const perfume = await perfumeModel.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!perfume)
            return res.status(404).json({ message: "Perfume not found" });
        res.json({ message: "Perfume updated", perfume });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update perfume",
            error: err.message,
        });
    }
};

export const deleteAllPerfumes = async (req, res) => {
    try {
        await perfumeModel.deleteMany({});
        res.json({ message: "All perfumes deleted successfully" });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete perfumes",
            error: err.message,
        });
    }
};

export const deletePerfume = async (req, res) => {
    try {
        const { id } = req.params;
        const perfume = await perfumeModel.findByIdAndDelete(id);
        if (!perfume)
            return res.status(404).json({ message: "Perfume not found" });
        res.json({ message: "Perfume deleted", perfume });
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete perfume",
            error: err.message,
        });
    }
};


import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        
        // Generate SKU if not provided
        if (!productData.sku) {
            productData.sku = `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        }

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: { product }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Product name or SKU already exists"
            });
        }
        
        res.status(400).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            search, 
            minPrice, 
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = { isActive: true };

        // Apply filters
        if (category) filter.category = { $regex: category, $options: 'i' };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { fragrance: { $regex: search, $options: 'i' } }
            ];
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const products = await Product.find(filter)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve products",
            error: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product retrieved successfully",
            data: { product }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve product",
            error: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Remove fields that shouldn't be updated directly
        delete updateData._id;

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: { product }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Product name or SKU already exists"
            });
        }

        res.status(400).json({
            success: false,
            message: "Failed to update product",
            error: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
};

export const updateProductStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock, operation = 'set' } = req.body;

        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid stock value"
            });
        }

        let updateData = {};
        if (operation === 'add') {
            updateData = { $inc: { stock: stock } };
        } else if (operation === 'subtract') {
            updateData = { $inc: { stock: -stock } };
        } else {
            updateData = { stock: stock };
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product stock updated successfully",
            data: { product }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update product stock",
            error: error.message
        });
    }
};

export const getProductCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });
        
        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            data: { categories }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve categories",
            error: error.message
        });
    }
};

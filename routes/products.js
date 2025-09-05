// routes/products.js
import express from "express";
import Product from "../models/Product.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all products...");
    const products = await Product.find();
    console.log(`Found ${products.length} products`);

    if (products.length > 0) {
      console.log("Sample product:", {
        id: products[0]._id,
        name: products[0].name,
        price: products[0].price,
        image: products[0].image,
      });
    }

    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching product with ID:", req.params.id);
    const product = await Product.findById(req.params.id);

    if (!product) {
      console.log("Product not found:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product found:", product.name);
    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Add product (admin only)
router.post("/", protect, admin, async (req, res) => {
  try {
    const { name, price, image, description } = req.body;
    console.log("Creating product:", { name, price, image, description });

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price required" });
    }

    const product = await Product.create({ name, price, image, description });
    console.log("Product created successfully:", product._id);
    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

// Update product (admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    console.log("Updating product:", req.params.id);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, req.body);
    await product.save();
    console.log("Product updated:", product._id);
    res.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete product (admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    console.log("Deleting product:", req.params.id);
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.deleteOne({ _id: req.params.id });
    console.log("Product deleted:", req.params.id);
    res.json({ message: "Product removed" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

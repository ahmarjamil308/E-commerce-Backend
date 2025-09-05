// routes/cart.js
import express from "express";
import Cart from "../models/Cart.js";
import { protect } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

// Add or update items
router.post("/", protect, async (req, res) => {
  const userId = req.user._id;
  const { items } = req.body;

  console.log("Add to cart request:", { userId, items });

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items required" });
  }

  try {
    const formattedItems = items.map((i) => ({
      product: new mongoose.Types.ObjectId(i.product),
      quantity: i.quantity || 1,
    }));

    console.log("Formatted items:", formattedItems);

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      console.log("Creating new cart");
      cart = await Cart.create({
        user: userId,
        products: formattedItems, // Use 'products' not 'items'
      });
    } else {
      console.log("Updating existing cart");
      formattedItems.forEach((item) => {
        const index = cart.products.findIndex(
          // Use 'products' not 'items'
          (i) => i.product.toString() === item.product.toString()
        );
        if (index > -1) {
          cart.products[index].quantity += item.quantity; // Use 'products'
        } else {
          cart.products.push(item); // Use 'products'
        }
      });
      await cart.save();
    }

    // Populate with correct path
    const populatedCart = await cart.populate(
      "products.product", // Use 'products' not 'items'
      "name price image description"
    );

    console.log("Cart saved successfully");
    res.json(populatedCart);
  } catch (err) {
    console.error("Cart error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get user cart
router.get("/", protect, async (req, res) => {
  try {
    console.log("Fetching cart for user:", req.user._id);

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "products.product", // Use 'products' not 'items'
      "name price image description"
    );

    if (!cart) {
      console.log("No cart found, returning empty cart");
      return res.json({ products: [] }); // Use 'products' not 'items'
    }

    console.log("Cart found with", cart.products.length, "items");
    res.json(cart);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: err.message });
  }
});

// Remove item from cart
router.delete("/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("Removing product from cart:", productId);

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      // Use 'products'
      (p) => p.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("products.product", "name price image description"); // Use 'products'

    console.log("Product removed from cart");
    res.json(cart);
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

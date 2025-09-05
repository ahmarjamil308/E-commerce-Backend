import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Add product to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Verify product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    console.log("Existing cart:", cart);

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        products: [{ product: productId, quantity }],
      });
      console.log("New cart created:", cart);
    } else {
      const item = cart.products.find(
        (p) => p.product.toString() === productId
      );
      if (item) {
        item.quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
      console.log("Cart before save:", cart);
      await cart.save();
      console.log("Cart after save:", cart);
    }

    // Populate product details
    await cart.populate("products.product");
    res.json(cart);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product"
    );
    if (!cart) return res.json({ products: [] });
    res.json(cart);
  } catch (err) {
    console.error("Error getting cart:", err);
    res.status(500).json({ message: err.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== productId
    );

    await cart.save();
    await cart.populate("products.product");
    res.json(cart);
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update quantity of product in cart
export const updateCartQty = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find((p) => p.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("products.product");

    res.json(cart);
  } catch (err) {
    console.error("Error updating cart quantity:", err);
    res.status(500).json({ message: err.message });
  }
};

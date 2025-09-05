import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

export const addProduct = async (req, res) => {
  const { name, price, image } = req.body;
  const product = await Product.create({ name, price, image });
  res.json(product);
};

import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import Product from "./models/Product.js";

const products = [
  {
    name: "Laptop",
    price: 700,
    image: "/products/laptop.jpeg",
    description: "High-performance laptop for work and gaming",
  },
  {
    name: "Phone",
    price: 400,
    image: "/products/mobile.jpeg",
    description: "Latest smartphone with advanced features",
  },
  {
    name: "Headphones",
    price: 50,
    image: "/products/headphone.jpeg",
    description: "Wireless headphones with noise cancellation",
  },
  {
    name: "Smartwatch",
    price: 150,
    image: "/products/smartwatch.jpeg",
    description: "Track your fitness and stay connected",
  },
  {
    name: "Tablet",
    price: 300,
    image: "/products/tablet.jpeg",
    description: "Portable tablet for work and entertainment",
  },
  {
    name: "Camera",
    price: 500,
    image: "/products/camera.jpeg",
    description: "Professional camera for capturing memories",
  },
  {
    name: "Gaming Mouse",
    price: 60,
    image: "/products/mouse.jpeg",
    description: "High-precision gaming mouse",
  },
  {
    name: "Keyboard",
    price: 80,
    image: "/products/keyboard.jpeg",
    description: "Mechanical keyboard for typing comfort",
  },
  {
    name: "Charger",
    price: 25,
    image: "/products/Charger.jpg",
    description: "Universal laptop charger",
  },
];

const seed = async () => {
  try {
    console.log("Starting database seeding...");

    // Connect to database
    await connectDB();

    console.log("Clearing existing products...");
    const deleteResult = await Product.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing products`);

    console.log("Inserting new products...");
    const insertedProducts = await Product.insertMany(products);
    console.log(`Successfully inserted ${insertedProducts.length} products:`);

    // Log each product for verification
    insertedProducts.forEach((product, index) => {
      console.log(
        `${index + 1}. ${product.name} - $${product.price} (ID: ${product._id})`
      );
    });

    console.log("\nDatabase seeding completed successfully!");

    // Verify the products were saved
    const count = await Product.countDocuments();
    console.log(`Total products in database: ${count}`);

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:");
    console.error("Error message:", err.message);
    console.error("Full error:", err);

    if (err.name === "ValidationError") {
      console.error("Validation errors:", err.errors);
    }

    process.exit(1);
  }
};

console.log("Environment check:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Set" : "✗ Missing");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");

seed();

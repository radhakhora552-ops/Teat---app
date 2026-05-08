const { readDB, writeDB } = require("../config/jsonDB");

const getProducts = (req, res) => {
  const db = readDB();
  res.json({ products: db.products || [] });
};

const createProduct = (req, res) => {
  const { name, price, category, inStock } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "Name, price and category required" });
  }

  const db = readDB();

  const product = {
    id: Date.now().toString(),
    name,
    price: Number(price),
    category,
    inStock: inStock !== undefined ? inStock : true,
    createdAt: new Date().toISOString()
  };

  db.products = db.products || [];
  db.products.unshift(product);

  writeDB(db);

  res.status(201).json({
    message: "Product created successfully",
    product
  });
};

const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, category, inStock } = req.body;

  const db = readDB();
  db.products = db.products || [];

  const productIndex = db.products.findIndex((product) => product.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  db.products[productIndex] = {
    ...db.products[productIndex],
    name: name || db.products[productIndex].name,
    price: price ? Number(price) : db.products[productIndex].price,
    category: category || db.products[productIndex].category,
    inStock:
      inStock !== undefined ? inStock : db.products[productIndex].inStock,
    updatedAt: new Date().toISOString()
  };

  writeDB(db);

  res.json({
    message: "Product updated successfully",
    product: db.products[productIndex]
  });
};

const deleteProduct = (req, res) => {
  const { id } = req.params;

  const db = readDB();
  db.products = db.products || [];

  const exists = db.products.find((product) => product.id === id);

  if (!exists) {
    return res.status(404).json({ message: "Product not found" });
  }

  db.products = db.products.filter((product) => product.id !== id);

  writeDB(db);

  res.json({ message: "Product deleted successfully" });
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
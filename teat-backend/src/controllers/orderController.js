const { readDB, writeDB } = require("../config/jsonDB");

const generateDeliveryOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const getOrders = (req, res) => {
  const db = readDB();
  res.json({ orders: db.orders || [] });
};

const createOrder = (req, res) => {
  const { items, totalAmount, deliveryFee, paymentMode, address, paymentInfo, location } =
  req.body;

  if (!items || items.length === 0 || !address) {
    return res.status(400).json({ message: "Items and address required" });
  }

  const db = readDB();
  db.orders = db.orders || [];

  const order = {
    id: Date.now().toString(),
    items,
    totalAmount: Number(totalAmount || 0),
    deliveryFee: Number(deliveryFee || 0),
    paymentMode: paymentMode || "Pay Now",
    paymentInfo: paymentInfo || null,
    address,
location: location || null,
status: "Placed",
    deliveryStatus: "Available",
    deliveryOtp: generateDeliveryOtp(),
    deliveryOtpVerified: false,
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(order);
  writeDB(db);

  res.status(201).json({
    message: "Order created successfully",
    order
  });
};

const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status, deliveryStatus, deliveryOtp } = req.body;

  const db = readDB();
  db.orders = db.orders || [];

  const orderIndex = db.orders.findIndex((order) => order.id === id);

  if (orderIndex === -1) {
    return res.status(404).json({ message: "Order not found" });
  }

  const order = db.orders[orderIndex];
if (status === "Cancelled") {
  if (order.status !== "Placed") {
    return res.status(400).json({
      message: "Order can only be cancelled before restaurant accepts it"
    });
  }

  db.orders[orderIndex] = {
    ...order,
    status: "Cancelled",
    deliveryStatus: "Cancelled",
    updatedAt: new Date().toISOString()
  };

  writeDB(db);

  return res.json({
    message: "Order cancelled successfully",
    order: db.orders[orderIndex]
  });
}
  if (deliveryStatus === "Delivered") {
    if (!deliveryOtp) {
      return res.status(400).json({
        message: "Customer delivery OTP is required"
      });
    }

    if (deliveryOtp !== order.deliveryOtp) {
      return res.status(400).json({
        message: "Invalid delivery OTP"
      });
    }

    order.deliveryOtpVerified = true;
  }

  db.orders[orderIndex] = {
    ...order,
    status: status || order.status,
    deliveryStatus: deliveryStatus || order.deliveryStatus,
    updatedAt: new Date().toISOString()
  };

  writeDB(db);

  res.json({
    message: "Order updated successfully",
    order: db.orders[orderIndex]
  });
};

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus
};
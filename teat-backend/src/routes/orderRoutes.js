const express = require("express");
const {
  getOrders,
  createOrder,
  updateOrderStatus
} = require("../controllers/orderController");

const router = express.Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.put("/:id/status", updateOrderStatus);

module.exports = router;
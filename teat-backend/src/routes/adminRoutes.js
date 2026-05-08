const express = require("express");
const {
  getUsers,
  approvePartner,
  rejectPartner
} = require("../controllers/adminController");

const router = express.Router();

router.get("/users", getUsers);
router.put("/approve-partner", approvePartner);
router.put("/reject-partner", rejectPartner);

module.exports = router;
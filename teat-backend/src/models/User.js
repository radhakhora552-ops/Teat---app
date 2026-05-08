const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },

    mobile: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["customer", "delivery", "restaurant", "admin"],
      default: "customer"
    },

    status: {
      type: String,
      enum: ["active", "pending", "approved", "rejected"],
      default: "active"
    },

    subscription: {
      name: {
        type: String,
        default: null
      },

      type: {
        type: String,
        default: null
      },

      price: {
        type: Number,
        default: 0
      },

      startDate: {
        type: Date,
        default: null
      },

      expiryDate: {
        type: Date,
        default: null
      },

      paymentStatus: {
        type: String,
        default: null
      }
    },

    addresses: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
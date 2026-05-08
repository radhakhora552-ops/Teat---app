const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readDB, writeDB } = require("../config/jsonDB");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "teat_secret", {
    expiresIn: "30d"
  });
};

const registerUser = async (req, res) => {
  try {
    const { fullName, mobile, email, password, role } = req.body;

    if (!fullName || !mobile || !email || !password) {
      return res.status(400).json({
        message: "Full name, mobile, email and password are required"
      });
    }

    const db = readDB();

    const existingUser = db.users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      fullName,
      mobile,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "customer",
      status: role === "customer" ? "active" : "pending",
      subscription: null,
      addresses: [],
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        mobile: newUser.mobile,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      },
      token: generateToken(newUser.id)
    });
  } catch (error) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const db = readDB();

    const user = db.users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (role && user.role !== role) {
      return res.status(401).json({
        message: "Invalid role selected"
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (
      (user.role === "delivery" || user.role === "restaurant") &&
      user.status !== "approved"
    ) {
      return res.status(403).json({
        message: "Your partner account is not approved by admin yet"
      });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        status: user.status,
        subscription: user.subscription,
        addresses: user.addresses
      },
      token: generateToken(user.id)
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};
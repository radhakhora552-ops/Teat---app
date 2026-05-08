const { readDB, writeDB } = require("../config/jsonDB");

const getUsers = (req, res) => {
  const db = readDB();

  const users = db.users.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    mobile: user.mobile,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt
  }));

  res.json({ users });
};

const approvePartner = (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Email and role are required" });
  }

  const db = readDB();

  const userIndex = db.users.findIndex(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.role === role
  );

  if (userIndex === -1) {
    return res.status(404).json({ message: "Partner user not found" });
  }

  db.users[userIndex].status = "approved";
  writeDB(db);

  res.json({
    message: "Partner approved successfully",
    user: db.users[userIndex]
  });
};

const rejectPartner = (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "Email and role are required" });
  }

  const db = readDB();

  const userIndex = db.users.findIndex(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      user.role === role
  );

  if (userIndex === -1) {
    return res.status(404).json({ message: "Partner user not found" });
  }

  db.users[userIndex].status = "rejected";
  writeDB(db);

  res.json({
    message: "Partner rejected successfully",
    user: db.users[userIndex]
  });
};

module.exports = {
  getUsers,
  approvePartner,
  rejectPartner
};
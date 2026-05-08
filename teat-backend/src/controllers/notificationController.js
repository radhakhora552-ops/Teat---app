const { readDB, writeDB } = require("../config/jsonDB");

const getNotifications = (req, res) => {
  const db = readDB();
  res.json({ notifications: db.notifications || [] });
};

const createNotification = (req, res) => {
  const { title, message, role } = req.body;

  if (!title || !message || !role) {
    return res.status(400).json({ message: "Title, message and role required" });
  }

  const db = readDB();
  db.notifications = db.notifications || [];

  const notification = {
    id: Date.now().toString(),
    title,
    message,
    role,
    read: false,
    createdAt: new Date().toISOString()
  };

  db.notifications.unshift(notification);
  writeDB(db);

  res.status(201).json({ message: "Notification created", notification });
};

const markNotificationRead = (req, res) => {
  const { id } = req.params;

  const db = readDB();
  db.notifications = db.notifications || [];

  db.notifications = db.notifications.map((item) =>
    item.id === id ? { ...item, read: true } : item
  );

  writeDB(db);

  res.json({ message: "Notification marked as read" });
};

module.exports = {
  getNotifications,
  createNotification,
  markNotificationRead
};
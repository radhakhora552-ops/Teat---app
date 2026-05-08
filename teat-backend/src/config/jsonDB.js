const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../data/db.json");

const initDB = () => {
  const folderPath = path.dirname(dbPath);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath,
      JSON.stringify(
        {
          users: [],
          products: [],
          orders: [],
          applications: []
        },
        null,
        2
      )
    );
  }
};

const readDB = () => {
  initDB();
  const data = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(data);
};

const writeDB = (data) => {
  initDB();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  readDB,
  writeDB
};
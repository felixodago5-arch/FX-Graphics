const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("./db/database.sqlite");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

app.use(
  session({
    secret: "fx-secret",
    resave: false,
    saveUninitialized: false
  })
);

// Database setup
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    status TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    filename TEXT,
    filepath TEXT,
    uploaded_at TEXT
  )`);
});

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use("/", require("./routes/auth"));
app.use("/admin", require("./routes/admin"));
app.use("/client", require("./routes/client"));

app.listen(3000, () => console.log("Server running on port 3000"));
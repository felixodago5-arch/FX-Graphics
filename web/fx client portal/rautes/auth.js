const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const db = req.db;

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (!user) return res.redirect("/login");

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect("/login");

    req.session.user = user;
    if (user.role === "admin") return res.redirect("/admin/dashboard");
    res.redirect("/client/dashboard");
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;
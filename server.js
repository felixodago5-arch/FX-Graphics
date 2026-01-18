const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// ==================== FILE UPLOAD CONFIG ====================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'images');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// ==================== DATABASE ====================
const DATA_FILE = path.join(__dirname, 'portfolio-data.json');

function initializeDatabase() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            portfolioItems: [],
            homepageItems: [],
            admin: { username: 'admin', password: bcrypt.hashSync('password123', 10) }
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}
function readData() {
    try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
    catch { return { portfolioItems: [], homepageItems: [], admin: {} }; }
}
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ==================== AUTH MIDDLEWARE ====================
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        req.user = jwt.verify(token, SECRET_KEY);
        next();
    } catch { res.status(403).json({ error: 'Invalid token' }); }
}

// ==================== API ROUTES ====================
// Keep all your /api/... routes exactly the same
// Example:
app.get('/api/portfolio', (req, res) => {
    const data = readData();
    res.json(data.portfolioItems);
});

// Add your other API routes here exactly like before…

// ==================== FRONTEND ROUTES ====================

// Portfolio frontend
app.use("/", express.static(path.join(__dirname, "dist/portfolio")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/portfolio/index.html"));
});

// Admin frontend
app.use("/admin", express.static(path.join(__dirname, "dist/admin")));
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/admin/index.html"));
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ==================== START SERVER ====================
initializeDatabase();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Admin credentials: username: admin, password: password123');
});

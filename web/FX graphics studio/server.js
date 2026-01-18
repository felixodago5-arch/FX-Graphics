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
app.use(express.static(path.join(__dirname)));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Database file path
const DATA_FILE = path.join(__dirname, 'portfolio-data.json');

// Initialize database
function initializeDatabase() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            portfolioItems: [],
            homepageItems: [],
            admin: {
                username: 'admin',
                password: bcrypt.hashSync('password123', 10) // Change this immediately!
            }
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Read data from file
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return { portfolioItems: [], homepageItems: [], admin: {} };
    }
}

// Write data to file
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data:', error);
    }
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
}

// ==================== AUTHENTICATION ENDPOINTS ====================

// Admin Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const data = readData();
    
    if (username !== data.admin.username) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const passwordMatch = bcrypt.compareSync(password, data.admin.password);
    if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ username: data.admin.username }, SECRET_KEY, { expiresIn: '24h' });
    res.json({ token, message: 'Login successful' });
});

// Change Admin Password
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const data = readData();
    
    const passwordMatch = bcrypt.compareSync(currentPassword, data.admin.password);
    if (!passwordMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    data.admin.password = bcrypt.hashSync(newPassword, 10);
    writeData(data);
    
    res.json({ message: 'Password changed successfully' });
});

// ==================== PORTFOLIO ENDPOINTS ====================

// Get all portfolio items
app.get('/api/portfolio', (req, res) => {
    const data = readData();
    res.json(data.portfolioItems);
});

// Get single portfolio item
app.get('/api/portfolio/:id', (req, res) => {
    const data = readData();
    const item = data.portfolioItems.find(p => p.id === req.params.id);
    
    if (!item) {
        return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    res.json(item);
});

// Create portfolio item
app.post('/api/portfolio', authenticateToken, upload.single('image'), (req, res) => {
    const { title, description, category, link } = req.body;
    const data = readData();
    
    if (!title || !category) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: 'Title and category are required' });
    }
    
    const newItem = {
        id: Date.now().toString(),
        title,
        description: description || '',
        category,
        link: link || '',
        image: req.file ? `/images/${req.file.filename}` : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    data.portfolioItems.push(newItem);
    writeData(data);
    
    res.status(201).json({ message: 'Portfolio item created', item: newItem });
});

// Update portfolio item
app.put('/api/portfolio/:id', authenticateToken, upload.single('image'), (req, res) => {
    const { title, description, category, link } = req.body;
    const data = readData();
    
    const itemIndex = data.portfolioItems.findIndex(p => p.id === req.params.id);
    if (itemIndex === -1) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    const item = data.portfolioItems[itemIndex];
    
    // Update fields
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (category) item.category = category;
    if (link !== undefined) item.link = link;
    
    // Handle new image
    if (req.file) {
        if (item.image) {
            const oldImagePath = path.join(__dirname, item.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        item.image = `/images/${req.file.filename}`;
    }
    
    item.updatedAt = new Date().toISOString();
    
    data.portfolioItems[itemIndex] = item;
    writeData(data);
    
    res.json({ message: 'Portfolio item updated', item });
});

// Delete portfolio item
app.delete('/api/portfolio/:id', authenticateToken, (req, res) => {
    const data = readData();
    
    const itemIndex = data.portfolioItems.findIndex(p => p.id === req.params.id);
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Portfolio item not found' });
    }
    
    const item = data.portfolioItems[itemIndex];
    
    // Delete image file
    if (item.image) {
        const imagePath = path.join(__dirname, item.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }
    
    data.portfolioItems.splice(itemIndex, 1);
    writeData(data);
    
    res.json({ message: 'Portfolio item deleted' });
});

// Get portfolio items by category
app.get('/api/portfolio/category/:category', (req, res) => {
    const data = readData();
    const items = data.portfolioItems.filter(p => p.category === req.params.category);
    res.json(items);
});

// ==================== HOMEPAGE ITEMS ENDPOINTS ====================

// Get all homepage items
app.get('/api/homepage', (req, res) => {
    const data = readData();
    res.json(data.homepageItems);
});

// Get single homepage item
app.get('/api/homepage/:id', (req, res) => {
    const data = readData();
    const item = data.homepageItems.find(p => p.id === req.params.id);
    
    if (!item) {
        return res.status(404).json({ error: 'Homepage item not found' });
    }
    
    res.json(item);
});

// Create homepage item
app.post('/api/homepage', authenticateToken, upload.single('image'), (req, res) => {
    const { title, description, category, link } = req.body;
    const data = readData();
    
    if (!title || !category) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: 'Title and category are required' });
    }
    
    const newItem = {
        id: Date.now().toString(),
        title,
        description: description || '',
        category,
        link: link || '',
        image: req.file ? `/images/${req.file.filename}` : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    data.homepageItems.push(newItem);
    writeData(data);
    
    res.status(201).json({ message: 'Homepage item created', item: newItem });
});

// Update homepage item
app.put('/api/homepage/:id', authenticateToken, upload.single('image'), (req, res) => {
    const { title, description, category, link } = req.body;
    const data = readData();
    
    const itemIndex = data.homepageItems.findIndex(p => p.id === req.params.id);
    if (itemIndex === -1) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ error: 'Homepage item not found' });
    }
    
    const item = data.homepageItems[itemIndex];
    
    // Update fields
    if (title) item.title = title;
    if (description !== undefined) item.description = description;
    if (category) item.category = category;
    if (link !== undefined) item.link = link;
    
    // Handle new image
    if (req.file) {
        if (item.image) {
            const oldImagePath = path.join(__dirname, item.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        item.image = `/images/${req.file.filename}`;
    }
    
    item.updatedAt = new Date().toISOString();
    
    data.homepageItems[itemIndex] = item;
    writeData(data);
    
    res.json({ message: 'Homepage item updated', item });
});

// Delete homepage item
app.delete('/api/homepage/:id', authenticateToken, (req, res) => {
    const data = readData();
    
    const itemIndex = data.homepageItems.findIndex(p => p.id === req.params.id);
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Homepage item not found' });
    }
    
    const item = data.homepageItems[itemIndex];
    
    // Delete image file
    if (item.image) {
        const imagePath = path.join(__dirname, item.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }
    
    data.homepageItems.splice(itemIndex, 1);
    writeData(data);
    
    res.json({ message: 'Homepage item deleted' });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Admin credentials: username: admin, password: password123');
    console.log('⚠️  IMPORTANT: Change admin password in production!');
});

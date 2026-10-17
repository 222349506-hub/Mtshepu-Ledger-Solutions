require('dotenv').config();

const express = require("express");
const cors = require("cors");
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-auth'],
    methods: ['GET','POST','PATCH','OPTIONS']
}));

app.use(express.json());
app.use(express.static(__dirname)); 

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to permanent MongoDB"))
	
// Debug log to trace what Node is actually receiving
console.log("Attempting connection with URI:", process.env.MONGO_URI);

if (!process.env.MONGO_URI) {
  console.error("Fatal Error: MONGO_URI is missing from your environment variables!");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB."))
	
    .catch(err => console.error("Mongo error:", err));
// --- SCHEMA - This replaces your in-memory array ---
const OrderSchema = new mongoose.Schema({
    clientName: String,
    clientEmail: String,
    selectedPackage: String,
    selectedItems: Array,
    isCustomOrder: Boolean,
    transactions: String,
    investment: String,
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);
// --- AUTH MIDDLEWARE ---
function adminAuth(req, res, next) {
    const token = req.headers['x-admin-auth'] || req.headers['authorization']?.replace('Bearer ','');
    if (!token || token.trim() !== (process.env.ADMIN_TOKEN || '').trim()) {
        return res.status(403).json({ success: false, message: "Access Denied: Invalid Administrative Authorization Token Criteria." });
    }
    next();
}

// --- 1. INITIALISE SQLITE STORAGE FILE DATABASE ---
const db = new sqlite3.Database('./mtshepu_ledger_vault.db', (err) => {
    if (err) console.error("Database connection failure:", err.message);
    else console.log("Connected to secure ledger order storage vault.");
});

// Create tables automatically if missing
db.run(`CREATE TABLE IF NOT EXISTS customer_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT,
    client_email TEXT,
    selected_items TEXT,
    transaction_tier TEXT,
    calculated_investment TEXT,
    status TEXT DEFAULT 'Pending',
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// --- 2. CONFIGURING ADMIN EMAIL ALERT DESK PIPELINE ---
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'christhembabikitsha@gmail.com',
        pass: process.env.GMAIL_PASS
    },
    tls: {
        // This line prevents Node.js from crashing over the self-signed certificate chain
        rejectUnauthorized: false 
    }
});

// --- 3. STANDARD SYSTEM ROUTES ---

// Test route matching your standard layout
app.get("/", (req, res) => {
    res.json({
        message: "Your server is online!",
        status: "success"
    });
});

// --- 4. INBOUND DATA ENDPOINT ROUTE ---
app.post('/api/orders/submit', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save(); // SAVES PERMANENTLY TO MONGODB
        res.json({ success: true, order: newOrder });
    } catch(e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// --- 5. SECURE ADMIN-ONLY DASHBOARD GATEWAY PORTAL ---
app.get('/api/orders/retrieve-vault', adminAuth, async (req, res) => {
    try {
        const vaultRecords = await Order.find().sort({ date: -1 }); // Gets from DB, not memory
        res.json({ success: true, vaultRecords });
    } catch(e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// --- SECURE API ROUTE TO UPDATE STATUS ---
app.patch('/api/orders/update-status/:id', adminAuth, async (req, res) => {
    try {
        const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.newStatus }, { new: true });
        res.json({ success: true, order: updated });
    } catch(e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
});
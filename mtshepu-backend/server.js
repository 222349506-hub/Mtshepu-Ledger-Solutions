require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS - allow your frontend ---
app.use(cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-auth'],
    methods: ['GET','POST','PATCH','OPTIONS']
}));
app.use(express.json());
app.use(express.static(__dirname)); 

// --- MongoDB Connection - SAME DB AS PREVIOUS PROJECT ---
// Uses process.env.MONGO_URI so it connects to your existing Atlas cluster
console.log("Attempting connection with URI:", process.env.MONGO_URI ? "MONGO_URI found" : "MISSING");

if (!process.env.MONGO_URI) {
  console.error("Fatal Error: MONGO_URI is missing from environment variables!");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB - same DB as previous project."))
  .catch(err => console.error("Mongo error:", err));

// --- PRICING (Same as nav-java.js to keep logic identical) ---
const PRICE_PER_ITEM = {
  "Bank reconciliation (1 month)": 950,
  "Preparing monthly income & Expense summary": 400,
  "Categorizing and posting": 450,
  "Debtors and Creditors aging report": 750,
  "Suppliers and Customer updates": 350,
  "Monthly management Report": 400,
  "Organizing Files (Digital)": 250,
  "Fixed asset register (basic)": 450,
  "Debtors follow-ups": 200,
  "Suppliers statement reconciliation": 350,
  "Monthly management pack": 650,
  "Budget vs Actual (basic)": 550,
  "WhatsApp Support": 150
};
const TRANSACTION_PRICING = {
  "40-60 transactions": 450,
  "100-150 transactions": 850,
  "200-250 transactions": 1150
};

function calculateInvestment(payload) {
  // Custom order
  if (payload.isCustomOrder) {
    let total = 0;
    const items = payload.selectedItems || [];
    items.forEach(name => total += PRICE_PER_ITEM[name] || 0);
    total += TRANSACTION_PRICING[payload.transactions] || 0;
    return `R ${total.toLocaleString('en-ZA', {minimumFractionDigits: 2})}`;
  }
  // Standard packages - use same tier logic as before
  const pkg = payload.selectedPackage;
  if (pkg === "Basic Package") return "R 1 550,00";
  if (pkg === "Standard Package") return "R 2 650,00";
  if (pkg === "Professional Package") return "R 3 550,00";
  return "R 0.00";
}

// --- SCHEMA ---
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

// --- AUTH ---
function adminAuth(req, res, next) {
    const token = req.headers['x-admin-auth'] || req.headers['authorization']?.replace('Bearer ','');
    if (!token || token.trim() !== (process.env.ADMIN_TOKEN || '').trim()) {
        return res.status(403).json({ success: false, message: "Access Denied: Invalid Administrative Authorization Token." });
    }
    next();
}

// --- ROUTES ---
app.get("/", (req, res) => {
    res.json({ message: "Server online - web-environment-3f0z", status: "success" });
});

// Submit - works for both Standard and Custom (same as previous project)
app.post('/api/orders/submit', async (req, res) => {
    try {
        const investment = calculateInvestment(req.body);
        const newOrder = new Order({
            ...req.body,
            investment: req.body.investment || investment
        });
        await newOrder.save();
        res.json({ success: true, order: newOrder, orderId: newOrder._id });
    } catch(e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// Retrieve - admin only
app.get('/api/orders/retrieve-vault', adminAuth, async (req, res) => {
    try {
        const vaultRecords = await Order.find().sort({ date: -1 });
        res.json({ success: true, vaultRecords });
    } catch(e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Update status - admin only
app.patch('/api/orders/update-status/:id', adminAuth, async (req, res) => {
    try {
        const newStatus = req.body.newStatus || req.body.status;
        const updated = await Order.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, order: updated });
    } catch(e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// Backwards compatibility: also support /update-status/:id without /api/orders prefix
app.patch('/update-status/:id', adminAuth, async (req, res) => {
    try {
        const newStatus = req.body.newStatus || req.body.status;
        const updated = await Order.findByIdAndUpdate(req.params.id, { status: newStatus }, { new: true });
        res.json({ success: true, order: updated });
    } catch(e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
});

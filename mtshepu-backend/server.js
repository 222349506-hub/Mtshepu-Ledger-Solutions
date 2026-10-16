require('dotenv').config();

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); 
app.use(cors({
  origin: '*', // Allows requests from any frontend URL or device
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-auth'] // Explicitly allows your admin token header
}));

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
  status TEXT DEFAULT 'Pending', -- ADDED THIS STATUS COLUMN
  submission_date DATETIME DEFAULT CURRENT_TIMESTAMP
)`);


// --- 2. CONFIGURING ADMIN EMAIL ALERT DESK PIPELINE ---
// Replace placeholders with your live service settings
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'christhembabikitsha@gmail.com',
    pass: process.env.GMAIL_PASS
  },
  tls: {
    // 💡 This line prevents Node.js from crashing over the self-signed certificate chain
    rejectUnauthorized: false 
  }
});


// --- 3. INBOUND DATA ENDPOINT ROUTE ---
// --- 3. INBOUND DATA ENDPOINT ROUTE ---
app.post('/api/orders/submit', (req, res) => {
  const { clientName, clientEmail, selectedItems, transactions } = req.body;

  // Basic validation required
  if (!clientName || !clientEmail) {
    return res.status(400).json({ success: false, message: "Name and email parameters are required." });
  }

  let calculatedInvestment = "";
  let itemsString = "";
  let transactionTier = transactions || "N/A";
  let emailSubject = "";
  let emailBody = "";

  // DYNAMIC RUNTIME PATHWAY DETECTOR:
  // If selectedItems exists and has content, treat it cleanly as a Calculator Custom Order
  if (selectedItems && Array.isArray(selectedItems) && selectedItems.length > 0) {
    
    // Explicit server-side pricing engine matrix mirroring your frontend values
    const BACKEND_PRICE_PER_ITEM = {
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

    const TRANSACTION_PRICING_MAP = { 
      "40-60 transactions": 450, 
      "100-150 transactions": 850, 
      "200-250 transactions": 1150 
    };

    // Calculate features total dynamically based on item name matching
    let featuresTotalCost = 0;
    selectedItems.forEach(item => {
      featuresTotalCost += BACKEND_PRICE_PER_ITEM[item] || 0;
    });

    const baseVolumeCost = TRANSACTION_PRICING_MAP[transactions] || 0;
    const verifiedTotal = featuresTotalCost + baseVolumeCost;

    calculatedInvestment = `R ${verifiedTotal}.00`;
    itemsString = `Custom Build: ${selectedItems.join(', ')}`;
    emailSubject = '🚨 New Custom Package Plan Compiled - Action Required';
    emailBody = `Admin Order Notice Summary:\n\nClient Name: ${clientName}\nClient Email: ${clientEmail}\nChosen Workspace Features: ${itemsString}\nExpected Monthly Volume: ${transactionTier}\nVerified Investment Level: ${calculatedInvestment}\n\nAccess local vault records file logs directly to verify contract invoice dispatch setup tracking details.`;

  } else {
    // FALLBACK PATHWAY: Handle Fixed Standard Subscription Packages if selectedItems is empty
    const selectedPackage = req.body.selectedPackage || "Standard Package"; 
    
    // Set prices for your predefined packages directly to prevent spoofing
    const FIXED_PRICING = { "Basic Package": "R 450.00", "Standard Package": "R 850.00", "Professional Package": "R 1445.00" };
    
    calculatedInvestment = FIXED_PRICING[selectedPackage] || "Contact for Quote";
    itemsString = `Standard Tier Subscription: ${selectedPackage}`;
    emailSubject = `💼 New Subscription Order: ${selectedPackage}`;
    emailBody = `Admin Order Notice Summary:\n\nClient Name: ${clientName}\nClient Email: ${clientEmail}\nSelected Package Plan: ${selectedPackage}\nAssigned Price Tier: ${calculatedInvestment}\n\nAccess local vault records file logs directly to verify contract invoice dispatch setup tracking details.`;
  }

  // Inject records into SQLite database table data matrix row records securely
  const sqlInsert = `INSERT INTO customer_orders (client_name, client_email, selected_items, transaction_tier, calculated_investment, status) VALUES (?, ?, ?, ?, ?, 'Pending')`;
  
  db.run(sqlInsert, [clientName, clientEmail, itemsString, transactionTier, calculatedInvestment], function(err) {
    if (err) {
      console.error("Database Engine Write Error:", err.message);
      return res.status(500).json({ success: false, message: "Storage validation crash on database engine." });
    }

    // Dispatch notification to your administration portal mailbox
    const alertEmailOptions = {
      from: 'christhembabikitsha@gmail.com',
      to: 'christhembabikitsha@gmail.com',
      subject: emailSubject,
      text: emailBody
    };

    emailTransporter.sendMail(alertEmailOptions, (mailErr, info) => {
      if (mailErr) console.error("Mail server alert delivery dispatch error failed:", mailErr);
      else console.log("Admin notification email sent: " + info.response);
    });

    res.json({ success: true, orderId: this.lastID });
  });
});


// --- 4. SECURE ADMIN-ONLY DASHBOARD GATEWAY PORTAL ---
// --- SECURE ADMIN-ONLY DASHBOARD GATEWAY PORTAL ---
// Matches the exact endpoint URL called by your admin.html layout front-end dashboard panel script
app.get('/api/orders/retrieve-vault', (req, res) => {
  const adminSecretKey = req.headers['x-admin-auth'];

  if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ success: false, message: "Access Denied: Invalid Administrative Authorization Token Criteria." });
  }

  db.all(`SELECT * FROM customer_orders ORDER BY submission_date DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    // Ensures response payload arrays route explicitly as valid JSON objects structures
    res.json({ success: true, vaultRecords: rows });
  });
});

// --- SECURE API ROUTE TO UPDATE STATUS ---
app.patch('/api/orders/update-status/:id', (req, res) => {
  const adminSecretKey = req.headers['x-admin-auth'];
  const orderId = req.params.id;
  const { newStatus } = req.body;

  // Verify Admin Security Token Credentials
  if (adminSecretKey !== 'MtshepuSecuredAdmin2026!') {
    return res.status(403).json({ success: false, message: "Access Denied: Invalid Administrative Token." });
  }

  const sqlUpdate = `UPDATE customer_orders SET status = ? WHERE id = ?`;
  
  db.run(sqlUpdate, [newStatus, orderId], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: "Database update failure." });
    }
    res.json({ success: true, message: "Status updated successfully." });
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.get('/', (req, res) => {
  res.send('Backend server is running successfully!');
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});


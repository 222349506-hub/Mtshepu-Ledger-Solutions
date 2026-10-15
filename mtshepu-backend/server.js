const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); 
app.use(cors()); // Permits communication across separate front-end ports safely

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
    user: 'Jaymtshepu@gmail.com',
    pass: 'YOUR_EMAIL_APP_PASSWORD_HERE' // Use a Gmail App Password, not your login password
  }
});


// --- 3. INBOUND DATA ENDPOINT ROUTE ---
// --- 3. INBOUND DATA ENDPOINT ROUTE ---
app.post('/api/orders/submit', (req, res) => {
  // Destructure the new variables sent by your frontend script
  const { clientName, clientEmail, isCustomOrder, selectedPackage, selectedItems, transactions } = req.body;

  // Basic validation required for both pathways
  if (!clientName || !clientEmail) {
    return res.status(400).json({ success: false, message: "Name and email parameters are required." });
  }

  let calculatedInvestment = "";
  let itemsString = "";
  let transactionTier = transactions || "N/A";
  let emailSubject = "";
  let emailBody = "";

  // Pathway A: Handle Custom Pricing Calculator Submission
  if (isCustomOrder) {
    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least 1 feature task module item." });
    }

    const PRICE_PER_ITEM = 150;
    const PRICING_MAP = { "40-60 transactions": 450, "100-150 transactions": 850, "200-250 transactions": 1445 };
    const baseCost = PRICING_MAP[transactions] || 0;
    const verifiedTotal = (selectedItems.length * PRICE_PER_ITEM) + baseCost;

    calculatedInvestment = `R ${verifiedTotal}.00`;
    itemsString = `Custom Build: ${selectedItems.join(', ')}`;
    emailSubject = '🚨 New Custom Package Plan Compiled - Action Required';
    emailBody = `Admin Order Notice Summary:\n\nClient Name: ${clientName}\nClient Email: ${clientEmail}\nChosen Workspace Features: ${itemsString}\nExpected Monthly Volume: ${transactionTier}\nVerified Investment Level: ${calculatedInvestment}\n\nAccess local vault records file logs directly to verify contract invoice dispatch setup tracking details.`;

  // Pathway B: Handle Fixed Standard Subscription Package Modal Click
  } else {
    if (!selectedPackage) {
      return res.status(400).json({ success: false, message: "No operational tier package selection defined." });
    }

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
      from: 'Jaymtshepu@gmail.com',
      to: 'Jaymtshepu@gmail.com',
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

  if (adminSecretKey !== 'MtshepuSecuredAdmin2026!') {
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

app.listen(3000, () => console.log('Mtshepu secure backend environment listening on port 3000...'));

  // 1. Safety check for the page title element
  var pageTitleElement = document.getElementById("currentPage");
  if (pageTitleElement !== null) {
    pageTitleElement.textContent = document.title;
  }

  // 2. Target the HTML nodes
  var linksMenu = document.getElementById("myLinks");
  var menuIcon = document.querySelector(".topnav .icon");

  // 3. Modern click event handler for the Hamburger Icon
  if (menuIcon) {
    menuIcon.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation(); // Blocks the click from trickling down to the empty space detector
      
      if (linksMenu.style.display === "block") {
        linksMenu.style.display = "none";
      } else {
        linksMenu.style.display = "block";
      }
    });
	
	  window.addEventListener('resize', function() {
    if (window.innerWidth >= 992) {
      linksMenu.classList.remove("open");
      linksMenu.removeAttribute("style"); // deletes the old inline display:block that is stuck
    }
  });
  }

  // 4. Close the menu when tapping ANY empty space on the page
  document.addEventListener('click', function(event) {
    if (!linksMenu || !menuIcon) return; // Exit early if elements are missing
    
    var clickedIcon = menuIcon.contains(event.target);
    var clickedInsideMenu = linksMenu.contains(event.target);
    
    // Close the dropdown if it is open and the click was on empty space
    if (linksMenu.style.display === "block" && !clickedIcon && !clickedInsideMenu) {
      linksMenu.style.display = "none";	  
    }
  });
  
  //Email and Phone number  //

function validateContactMethod() {
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();

  // If both fields are completely empty, block submission and alert the user
  if (phone === "" && email === "") {
    alert("Please fill in at least one contact method: Phone Number or Email Address.");
    return false; // Prevents the form from submitting
  }
  return true; // Allows form to submit safely if at least one is filled
}

  //Terms and Conditions //
function openTerms() {
document.getElementById("termsModal").style.display = "block";

document.body.style.overflow = "hidden";
}
function closeTerms()  {
	document.getElementById("termsModal").style.display = "none";
	document.body.style.overflow = "auto";
}

// Privacy Policy //

function openPrivacy() {
document.getElementById("privacyModal").style.display = "block";

document.body.style.overflow = "hidden";
}
function closePrivacy()  {
	document.getElementById("privacyModal").style.display = "none";
	document.body.style.overflow = "auto";
}

window.onclick = function(event) {
  var termsModal = document.getElementById("termsModal");
  var privacyModal = document.getElementById("privacyModal");

  // terms window event //
if (event.target == termsModal) {
    closeTerms();
  }

  // Privacy window event //
if (event.target == privacyModal) {
    closePrivacy();
  }
};

let isSubmittingOrder = false;

const BACKEND_BASE_URL = 'https://web-environment-3f0z.onrender.com';
const API_ORDERS_URL = `${BACKEND_BASE_URL}/api/orders`;

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

let currentlySelectedPackage = "";

function selectPackage(packageName, element) {
  currentlySelectedPackage = packageName;
  document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected-package'));
  if(element) element.closest('.package-card')?.classList.add('selected-package');
  const title = document.getElementById("modalTitleDisplay");
  if(title) title.innerText = `Complete Your Order - ${packageName}`;
  openCheckout();
}
function openCheckout() {
  const modal = document.getElementById("openCheckoutmodal");
  if(modal){ modal.style.display = "flex"; document.body.style.overflow="hidden"; }
}
function closeCheckout() {
  const modal = document.getElementById("openCheckoutmodal");
  if(modal){ modal.style.display = "none"; document.body.style.overflow="auto"; }
}
function toggleCustomBuilder() {
  const box = document.getElementById("customBuilderSection");
  if(!box) return;
  box.style.display = box.style.display === "block" ? "none" : "block";
  if(box.style.display === "block"){ box.scrollIntoView({behavior:'smooth'}); calculateCustomPrice(); }
}
function calculateCustomPrice() {
  let total = 0;
  document.querySelectorAll('.custom-feature-checkbox:checked').forEach(cb => total += PRICE_PER_ITEM[cb.value]||0);
  const tier = document.getElementById("transactionDropdown")?.value || "";
  total += TRANSACTION_PRICING[tier] || 0;
  const el = document.getElementById("estimatedPriceDisplay");
  if(el) el.innerText = "R " + total.toLocaleString('en-ZA',{minimumFractionDigits:2});
}

async function submitOrderPayloadToServer() {
	if (isSubmittingOrder) 
		return;
  const name = document.getElementById("modalClientName")?.value.trim();
  const email = document.getElementById("modalClientEmail")?.value.trim();
  if(!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    alert("Check Name and Email"); 
	return;
  }
  
    isSubmittingOrder = true;
  const submitBtn = document.querySelector("#openCheckoutmodal button[onclick*='submitOrderPayloadToServer']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";
  }

  console.log("Submitting to", `${API_ORDERS_URL}/submit`);
  try{
    const res = await fetch(`${API_ORDERS_URL}/submit`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({clientName:name, clientEmail:email, selectedPackage:currentlySelectedPackage, isCustomOrder:false})
    });
    const data = await res.json();
    console.log("Server response", data);
    if(data.success){ 
      alert("Success! Filed to web-environment-3f0z DB"); 
      closeCheckout();

window.location.href = "Thank_You.html";	  
    } else {
      alert("Error: "+(data.message||"unknown"));
    }
  }catch(e){ 
    console.error(e); 
    alert("Could not connect to "+BACKEND_BASE_URL); 
  } finally {
    // 3. The 'finally' block ALWAYS runs, resetting the UI even if the network fails
    isSubmittingOrder = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Order"; // Change back to your button's original text
    }
  }
}

async function submitCustomOrderToServer() {
	if (isSubmittingOrder)
		return;
  const name = document.getElementById("clientNameInput")?.value.trim();
  const email = document.getElementById("clientEmailInput")?.value.trim();
  if(!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    alert("Check name and email"); return;
  }
 const chosen = [...document.querySelectorAll('.custom-feature-checkbox:checked')].map(b=>b.value);
  if(chosen.length===0){ 
    alert("Select at least 1 feature"); 
    return; 
  }
  const transactions = document.getElementById("transactionDropdown")?.value;

  // 2. Set flag to true and disable the button
  isSubmittingOrder = true;
  const submitBtn = document.querySelector("#customBuilderSection button[onclick*='submitCustomOrderToServer']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";
  }

  console.log("Submitting custom to", `${API_ORDERS_URL}/submit`);
  try{
    const res = await fetch(`${API_ORDERS_URL}/submit`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({clientName:name, clientEmail:email, selectedItems:chosen, transactions, isCustomOrder:true})
    });
    const data = await res.json();
    console.log("Server response", data);
    if(data.success){ 
      alert("Custom package filed successfully!");
      document.getElementById("clientNameInput").value="";
      document.getElementById("clientEmailInput").value="";
      document.querySelectorAll('.custom-feature-checkbox:checked').forEach(b=>b.checked=false);
      calculateCustomPrice();
	  
	  window.location.href = "Thank_You.html";
    } else {
      alert("Error: "+data.message);
    }
  }catch(e){ 
    console.error(e); 
    alert("Could not connect to "+BACKEND_BASE_URL); 
  } finally {
    // 3. Reset flag and UI elements safely
    isSubmittingOrder = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Custom Order"; // Change back to your button's original text
    }
  }
}
// ADMINISTRATIVE VAULT MANAGEMENT PORTAL
// ==========================================

// Global state for active token
let activeAdminToken = localStorage.getItem("adminToken") || "";

// 1. Run automatically on page load to check for an existing session
document.addEventListener("DOMContentLoaded", () => {
  if (activeAdminToken) {
    console.log("Found saved admin token. Restoring session view...");
    
    // IMMEDIATELY hide the login/auth prompt screen so it doesn't flicker
    const authSection = document.getElementById("authSection") || document.getElementById("loginBox");
    const consoleSection = document.getElementById("consoleSection") || document.getElementById("dashboardConsole");
    
    if (authSection) authSection.style.display = "none";
    if (consoleSection) consoleSection.style.display = "block"; // or "flex" depending on your CSS layout

    // Fetch your database logs in the background using the saved token
    retrieveDatabaseVaultLogs();
  }
});

// 2. Core authorization verification function
async function verifyAdminAuthorization() {
  // Replace 'adminPinInput' with the actual ID of your text/password input node
  const pinInputEl = document.getElementById("adminPinInput");
  const enteredToken = pinInputEl ? pinInputEl.value.trim() : "";

  if (!enteredToken) {
    alert("Please enter an administrative access key.");
    return;
  }

  const statusLabel = document.getElementById("authStatusDisplay"); // Optional loading label
  if (statusLabel) statusLabel.innerText = "Authenticating...";

  try {
    const res = await fetch(`${API_ORDERS_URL}/retrieve-vault`, {
      method: 'GET',
      headers: {
        'x-admin-auth': enteredToken
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      // SUCCESS: Commit token to browser local memory storage
      activeAdminToken = enteredToken;
      localStorage.setItem("adminToken", enteredToken);
      
      // Call your layout renderer function passing database logs
      renderVaultConsoleData(data.vaultRecords);
    } else {
      alert("Access Denied: " + (data.message || "Invalid Token"));
      if (statusLabel) statusLabel.innerText = "";
    }
  } catch (e) {
    console.error(e);
    alert("Could not connect to database vault server endpoint.");
    if (statusLabel) statusLabel.innerText = "";
  }
}

// 3. Automated background fetch for refreshes & data mutations
async function retrieveDatabaseVaultLogs() {
  if (!activeAdminToken) return;

  try {
    const res = await fetch(`${API_ORDERS_URL}/retrieve-vault`, {
      method: 'GET',
      headers: {
        'x-admin-auth': activeAdminToken
      }
    });
    const data = await res.json();
    if (data.success) {
      renderVaultConsoleData(data.vaultRecords);
    } else {
      // If token expired or server env token changed, wipe stale storage
      clearAdminSession();
    }
  } catch (e) {
    console.error("Vault background reload failed:", e);
  }
}

// 4. Update order status patch request
async function updateVaultOrderStatus(orderId, newStatus) {
  if (!activeAdminToken) {
    alert("No valid authorization session detected.");
    return;
  }

  try {
    const res = await fetch(`${API_ORDERS_URL}/update-status/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-auth': activeAdminToken
      },
      body: JSON.stringify({ newStatus: newStatus })
    });
    
    const data = await res.json();
    if (data.success) {
      // Refresh the console table automatically without forcing pin input
      retrieveDatabaseVaultLogs();
    } else {
      alert("Status update failed: " + data.message);
    }
  } catch (e) {
    console.error(e);
  }
}

// 5. Clean Exit Console / Log out
function clearAdminSession() {
  localStorage.removeItem("adminToken");
  activeAdminToken = "";
  // Reload page to wipe local array nodes and return securely to authorization prompt view
  window.location.reload();
}

// 6. Template Placeholder for rendering your database records array
function renderVaultConsoleData(vaultRecords) {
  console.log("Vault records successfully pulled:", vaultRecords);
  
  // 1. Toggle UI Views to ensure console is visible and login is hidden
  const authSection = document.getElementById("authSection") || document.getElementById("loginBox") || document.querySelector("h2[onclick*='verify']");
  const consoleSection = document.getElementById("customBuilderSection") || document.getElementById("dashboardConsole") || document.querySelector("h2:nth-of-type(2)");
  
  // Custom structural fallback to match your specific layout wrapper styles
  if (authSection && authSection.parentElement) {
    // If you have specific sections, flip them. Otherwise we modify display states directly:
    const loginWrapper = document.getElementById("admin-login-wrapper");
    const consoleWrapper = document.getElementById("admin-console-wrapper");
    if (loginWrapper) loginWrapper.style.display = "none";
    if (consoleWrapper) consoleWrapper.style.display = "block";
  }

  // 2. Target your table body wrapper (Update 'vaultTableBody' to match your actual HTML <tbody> ID)
  const tableBody = document.getElementById("vaultTableBody") || document.querySelector("table tbody");
  if (!tableBody) {
    console.error("Could not find a table body <tbody> element to inject data into!");
    return;
  }

  // Clear any old rows out before rendering fresh array content
  tableBody.innerHTML = "";

  if (!vaultRecords || vaultRecords.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No administrative data entries found.</td></tr>`;
    return;
  }

  // 3. Loop through your live database logs array records
  vaultRecords.forEach(record => {
    const row = document.createElement("tr");

    // Clean up date timestamp display
    const formattedDate = record.date ? new Date(record.date).toLocaleDateString('en-ZA') : 'N/A';
    
    // Parse client information parameters cleanly
    const clientInfo = `
      <strong>${record.clientName || 'Unknown'}</strong><br>
      <small style="color:#666;">${record.clientEmail || 'No Email'}</small>
    `;

    // Process array elements for requested package modules
    let modulesList = "";
    if (record.isCustomOrder && record.selectedItems) {
      modulesList = record.selectedItems.map(item => `• ${item}`).join("<br>");
    } else {
      modulesList = `<strong>Package:</strong> ${record.selectedPackage || 'Standard Line'}`;
    }

    // Build unique tracking dropdown selection options dynamically
    const statusOptions = ['Pending', 'In Progress', 'Invoiced'].map(statusOption => {
      const selectedAttr = (record.status === statusOption) ? 'selected' : '';
      return `<option value="${statusOption}" ${selectedAttr}>${statusOption}</option>`;
    }).join('');

    // Inject compiled row markup template columns directly into the row container
    row.innerHTML = `
      <td><small style="font-family:monospace; color:#888;">${record._id ? record._id.substring(record._id.length - 6) : 'N/A'}</small></td>
      <td>${formattedDate}</td>
      <td>${clientInfo}</td>
      <td><div style="max-height:80px; overflow-y:auto; font-size:13px;">${modulesList}</div></td>
      <td>${record.transactions || 'Standard Pkg'}</td>
      <td style="font-weight:bold; color:#2e7d32;">${record.investment || 'R 0.00'}</td>
      <td>
        <select class="status-dropdown" onchange="updateVaultOrderStatus('${record._id}', this.value)" style="padding:4px; border-radius:4px; font-weight:600;">
          ${statusOptions}
        </select>
      </td>
    `;

    tableBody.appendChild(row);
  });
}
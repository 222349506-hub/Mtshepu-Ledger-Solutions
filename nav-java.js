// =========================================================================
// 1. NAVIGATION & LAYOUT CORE CONTROLLERS
// =========================================================================

// Safety check for the page title element
var pageTitleElement = document.getElementById("currentPage");
if (pageTitleElement !== null) {
  pageTitleElement.textContent = document.title;
}

// Target the HTML nodes
var linksMenu = document.getElementById("myLinks");
var menuIcon = document.querySelector(".topnav .icon");

// Modern click event handler for the Hamburger Icon
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
}

// Close the menu when tapping ANY empty space on the page
document.addEventListener('click', function(event) {
  if (!linksMenu || !menuIcon) return; // Exit early if elements are missing
  
  var clickedIcon = menuIcon.contains(event.target);
  var clickedInsideMenu = linksMenu.contains(event.target);
  
  // Close the dropdown if it is open and the click was on empty space
  if (linksMenu.style.display === "block" && !clickedIcon && !clickedInsideMenu) {
    linksMenu.style.display = "none";	  
  }
});

// =========================================================================
// 2. VALIDATION & POLICIES INTERFACES
// =========================================================================

// Email and Phone number validation
function validateContactMethod() {
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();

  if (phone === "" && email === "") {
    alert("Please fill in at least one contact method: Phone Number or Email Address.");
    return false; // Prevents the form from submitting
  }
  return true; // Allows form to submit safely if at least one is filled
}

// Terms and Conditions Modal triggers
function openTerms() {
  document.getElementById("termsModal").style.display = "block";
  document.body.style.overflow = "hidden";
}
function closeTerms()  {
  document.getElementById("termsModal").style.display = "none";
  document.body.style.overflow = "auto";
}

// Privacy Policy Modal triggers
function openPrivacy() {
  document.getElementById("privacyModal").style.display = "block";
  document.body.style.overflow = "hidden";
}
function closePrivacy()  {
  document.getElementById("privacyModal").style.display = "none";
  document.body.style.overflow = "auto";
}

// Window background click catcher to dismiss modals
window.onclick = function(event) {
  var termsModal = document.getElementById("termsModal");
  var privacyModal = document.getElementById("privacyModal");

  if (event.target == termsModal) {
    closeTerms();
  }
  if (event.target == privacyModal) {
    closePrivacy();
  }
};

// =========================================================================
// 3. CORE PRICING CONFIGURATION MATRICES
// =========================================================================
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

// =========================================================================
// 4. FIXED SYSTEM PACKAGES LOGIC & DATA SUBMISSION
// =========================================================================
let currentlySelectedPackage = "";

function selectPackage(packageName, element) {
  currentlySelectedPackage = packageName;
  
  const cards = document.querySelectorAll('.package-card');
  cards.forEach(card => card.classList.remove('selected-package'));
  
  if (element && element.parentElement) {
    element.parentElement.classList.add('selected-package');
  }
  
  const modalTitle = document.getElementById("modalTitleDisplay");
  if (modalTitle) {
    modalTitle.innerText = `Complete Your Order - ${packageName}`;
  }
  openCheckout();
}

function openCheckout() {
  const modal = document.getElementById("openCheckoutmodal");
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  } else {
    console.error("Could not find element with ID 'openCheckoutmodal'");
  }
}

function closeCheckout() {
  const modal = document.getElementById("openCheckoutmodal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// DISPATCH STANDARD PLAN RESERVATION PAYLOADS
function submitOrderPayloadToServer() {
  const name = document.getElementById("modalClientName").value.trim();
  const email = document.getElementById("modalClientEmail").value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Fixed Regex

  if (!name || !email || !emailPattern.test(email)) {
    alert("Please check your name and email parameters before processing.");
    return;
  }  

  const orderPayload = {
    clientName: name,
    clientEmail: email,
    selectedPackage: currentlySelectedPackage,
    isCustomOrder: false
  };

  fetch('https://ml-server-1-sdxt.onrender.com/api/orders/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success || data.orderId) { 
      alert("Your package setup request has been filed successfully!");
      closeCheckout();
      document.getElementById("modalClientName").value = "";
      document.getElementById("modalClientEmail").value = "";
    } else {
      alert("Submission Error: " + (data.message || "Unknown error"));
    }
  })
  .catch(err => {
    console.error("Networking error:", err);
    alert("Could not connect to the processing server framework.");
  });
}


// =========================================================================
// 5. DYNAMIC CUSTOM BUILDER WORKSPACE LOGIC
// =========================================================================
function toggleCustomBuilder() {
  const builderBox = document.getElementById("customBuilderSection");
  if (builderBox.style.display === "block") {
    builderBox.style.display = "none";
  } else {
    builderBox.style.display = "block";
    builderBox.scrollIntoView({ behavior: 'smooth' });
    calculateCustomPrice();
  }
}

function calculateCustomPrice() {
  const checkedBoxes = document.querySelectorAll('.custom-feature-checkbox:checked');
  let featuresTotalCost = 0;
    
  checkedBoxes.forEach(checkbox => {
    const featureName = checkbox.value; 
    featuresTotalCost += PRICE_PER_ITEM[featureName] || 0;
  });

  const transactionDropdown = document.getElementById("transactionDropdown");
  const transactionTier = transactionDropdown ? transactionDropdown.value : "";
  const transactionPrice = TRANSACTION_PRICING[transactionTier] || 0;

  const finalEstimate = featuresTotalCost + transactionPrice;
  const displayElement = document.getElementById("estimatedPriceDisplay");
  if (displayElement) {
    displayElement.innerText = "R " + finalEstimate.toLocaleString('en-ZA', { minimumFractionDigits: 2 });
  } else {
    console.error("Could not find HTML element with id='estimatedPriceDisplay'");
  }
}

// DISPATCH DYNAMIC CUSTOM PLAN BUILD DATA
function submitCustomOrderToServer() {
  const name = document.getElementById("clientNameInput").value.trim();
  const email = document.getElementById("clientEmailInput").value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Fixed Regex
  
  if (!name || !email || !emailPattern.test(email)) {
    alert("Please check your name and email parameters before processing.");
    return;
  }  
  
  const chosenFeatures = [];
  document.querySelectorAll('.custom-feature-checkbox:checked').forEach(box => {
    chosenFeatures.push(box.value);
  });
  
  if (chosenFeatures.length === 0) {
    alert("Please select at least 1 feature task module item first.");
    return;
  }

  const transactionTier = document.getElementById("transactionDropdown").value;

  const orderPayload = {
    clientName: name,
    clientEmail: email,
    selectedItems: chosenFeatures,
    transactions: transactionTier,
    isCustomOrder: true
  };

  fetch('https://ml-server-1-sdxt.onrender.com/api/orders/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Your custom package setup request has been filed successfully!");
      document.getElementById("clientNameInput").value = "";
      document.getElementById("clientEmailInput").value = "";
      document.querySelectorAll('.custom-feature-checkbox:checked').forEach(box => box.checked = false);
      calculateCustomPrice();
    } else {
      alert("Submission Error: " + data.message);
    }
  })
  .catch(err => {
    console.error("Networking error occurred:", err);
    alert("Could not connect to the processing server framework.");
  });
}

function loadVaultOrders() {
  // Target your token input field (make sure your input tag has id="adminTokenInput")
  const tokenInput = document.getElementById("adminTokenInput");
  const token = tokenInput ? tokenInput.value.trim() : "";

  if (!token) {
    alert("Please provide an active administrative token before loading.");
    return;
  }

  // Fire the request with the token attached inside the Authorization header
  fetch('https://onrender.com', {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    }
  })
  .then(response => {
    if (response.status === 403) {
      throw new Error("403 Forbidden: Invalid or expired administrative token.");
    }
    if (!response.ok) {
      throw new Error(`Server returned status code: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.success && data.vaultRecords) {
      renderVaultTable(data.vaultRecords);
    } else {
      alert("Vault Error: " + (data.message || "Failed to parse records data."));
    }
  })
  .catch(err => {
    console.error("Administrative Vault Access Error:", err);
    alert(err.message || "Could not connect to the administrative backend.");
  });
}

// Function to dynamically build rows inside your admin table template
function renderVaultTable(records) {
  const tableBody = document.getElementById("vaultTableBody");
  if (!tableBody) {
    console.error("Could not find a table body element with id='vaultTableBody'");
    return;
  }

  // Clear existing static placeholder elements
  tableBody.innerHTML = "";

  if (records.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No administrative orders found in the system.</td></tr>`;
    return;
  }

  // Populate rows dynamically from server metadata matrix
  records.forEach(order => {
    const row = document.createElement("tr");
    
    // Format package details or custom module arrays cleanly
    const packageDetails = order.isCustomOrder 
      ? `<strong>Custom:</strong> ${order.selectedItems ? order.selectedItems.join(', ') : 'None'}`
      : order.selectedPackage || "N/A";

    row.innerHTML = `
      <td>${order.id || order._id || 'N/A'}</td>
      <td>
        <strong>${order.clientName || 'Unknown'}</strong><br>
        <small>${order.clientEmail || 'N/A'}</small>
      </td>
      <td>${packageDetails}</td>
      <td>${order.transactions || 'Standard'}</td>
      <td>${order.investment || 'R 0.00'}</td>
      <td>${order.date ? new Date(order.date).toLocaleDateString('en-ZA') : 'N/A'}</td>
      <td><span class="status-badge">${order.status || 'Pending'}</span></td>
    `;
    tableBody.appendChild(row);
  });
}
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
  const name = document.getElementById("modalClientName")?.value.trim();
  const email = document.getElementById("modalClientEmail")?.value.trim();
  if(!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    alert("Check name and email"); return;
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
    if(data.success){ alert("Success! Filed to web-environment-3f0z DB"); closeCheckout(); }
    else alert("Error: "+(data.message||"unknown"));
  }catch(e){ console.error(e); alert("Could not connect to "+BACKEND_BASE_URL); }
}

async function submitCustomOrderToServer() {
  const name = document.getElementById("clientNameInput")?.value.trim();
  const email = document.getElementById("clientEmailInput")?.value.trim();
  if(!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    alert("Check name and email"); return;
  }
  const chosen = [...document.querySelectorAll('.custom-feature-checkbox:checked')].map(b=>b.value);
  if(chosen.length===0){ alert("Select at least 1 feature"); return; }
  const transactions = document.getElementById("transactionDropdown")?.value;
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
    } else alert("Error: "+data.message);
  }catch(e){ console.error(e); alert("Could not connect to "+BACKEND_BASE_URL); }
}

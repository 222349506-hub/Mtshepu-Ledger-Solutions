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

// Packages //
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

// Checkout pop-up //
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
  
function submitOrderPayloadToServer() {
  // Pull from the correct modal text IDs
  const name = document.getElementById("modalClientName").value.trim();
  const email = document.getElementById("modalClientEmail").value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name) {
    alert("Please enter your name so we can process your proposal quotation file.");
    return;
  }
    if (!email) {
    alert("Please enter your email so we can process your proposal quotation file.");
    return;
  }
    if (!emailPattern.test(email)) {
    alert("Please enter a valid email so we can process your proposal quotation file.");
    return;
  }  

  // Constructing package request payload structure
  const orderPayload = {
    clientName: name,
    clientEmail: email,
    selectedPackage: currentlySelectedPackage,
    isCustomOrder: false
  };

  // Pushing request to your running server framework
  fetch('http://localhost:3000/api/orders/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success || data.id) { // standard check for node / express responses
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

function processCustomSubmission() {
  const chosenFeatures = [];
  const featureCheckboxes = document.querySelectorAll('.custom-feature-checkbox:checked');
  
  featureCheckboxes.forEach(box => {
    chosenFeatures.push(box.value);
  });
  
  const transactionTier = document.getElementById("transactionDropdown").value;
  
  if (chosenFeatures.length === 0) {
    alert("Please select at least 1 feature to build your custom operational ledger workspace.");
    return;
  }
  
  console.log("Custom Order Logged:", { features: chosenFeatures, volumeTier: transactionTier });
  alert(`Your Custom Solution has been compiled successfully!\n\nIncluded Tasks: ${chosenFeatures.length} individual items\nTransaction Range: ${transactionTier}`);
}

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

function submitCustomOrderToServer() {
  const name = document.getElementById("clientNameInput").value.trim();
  const email = document.getElementById("clientEmailInput").value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!name) {
    alert("Please enter your name so we can process your proposal quotation file.");
    return;
  }
    if (!email) {
    alert("Please enter your email so we can process your proposal quotation file.");
    return;
  }
    if (!emailPattern.test(email)) {
    alert("Please a valid email so we can process your proposal quotation file.");
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

  fetch('http://localhost:3000/api/orders/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("Your package setup request has been filed successfully!.");
    } else {
      alert("Submission Error: " + data.message);
    }
  })
  .catch(err => {
    console.error("Networking error occurred:", err);
    alert("Could not connect to the processing server framework.");
  });
}



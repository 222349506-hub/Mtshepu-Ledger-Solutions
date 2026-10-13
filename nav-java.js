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
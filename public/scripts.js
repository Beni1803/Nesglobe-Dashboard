// Constants
const MAX_IDLE_TIME = 15 * 60 * 1000;

let idleTimeout;

// IDLE TIMEOUT FUNCTIONS
function resetIdleTimeout() {
    if (idleTimeout) clearTimeout(idleTimeout);
    idleTimeout = setTimeout(logoutDueToInactivity, MAX_IDLE_TIME);
}

function logoutDueToInactivity() {
    displayFeedbackMessage('You have been logged out due to inactivity.', 'alert-warning');
    $('#timeoutModal').modal('show');
    signOut();
}

// FEEDBACK FUNCTIONS
function displayFeedbackMessage(message, className) {
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = message;
    feedbackArea.className = `alert ${className}`;
    feedbackArea.style.display = 'block';
}

function clearFeedbackArea() {
    const feedbackArea = document.getElementById('feedbackArea');
    feedbackArea.textContent = '';
    feedbackArea.style.display = 'none';
}

// VALIDATION FUNCTIONS
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// UI EVENT SETUP FUNCTIONS
function setupSignInToggle() {
    document.querySelectorAll('input[name="signInMethod"]').forEach(input => {
        input.addEventListener('change', function() {
            const isEmailPasswordMethod = this.value === 'emailPassword';
            document.getElementById('emailPasswordFormModal').style.display = isEmailPasswordMethod ? 'block' : 'none';
        });
    });
}

function setupDashboardLinks() {
    document.body.addEventListener('click', function(e) {
        if (e.target.matches('.list-group-item-action')) {
            e.preventDefault();
            loadDashboard(e.target.getAttribute('data-url'));
        }
    });
}

function loadDashboard(url) {
    window.open(url, '_blank');
}

function loadTabContents() {
    const tabs = ['home', 'arcgis', 'webapp', 'networksdata', 'rfp', 'economicsdata', 'templates'];
    tabs.forEach(tab => {
        fetch(`${tab}_tab_content.html`)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load content for tab: ${tab}`);
                return response.text();
            })
            .then(data => {
                const tabContainer = document.querySelector(`#${tab}`);
                tabContainer.innerHTML = data;
            })
            .catch(error => console.error(error.message));
    });
}

function setupButtonEvents() {
  document.getElementById('signInWithEmailButtonModal').addEventListener('click', function(e) {
      e.preventDefault();
      signInWithEmail();
  });

  document.getElementById('signOutButtonModal').addEventListener('click', function(e) {
      e.preventDefault();
      signOut();
  });

  document.getElementById('forgotPasswordLink').addEventListener('click', function(e) {
      e.preventDefault();
      const email = document.getElementById('emailFieldModal').value;
      if (validateEmail(email)) {
          resetPassword(email);
      } else {
          displayFeedbackMessage('Please enter a valid email address to reset your password.', 'alert-warning');
      }
  });
}


// INITIALIZATION
document.addEventListener("DOMContentLoaded", function() {
    resetIdleTimeout();
    setupSignInToggle();
    setupDashboardLinks();
    loadTabContents();
    setupButtonEvents();

    // Listeners for user activity to reset idle timeout
    document.addEventListener('mousemove', resetIdleTimeout);
    document.addEventListener('keydown', resetIdleTimeout);
});


document.addEventListener('DOMContentLoaded', (event) => {
    setTimeout(() => {
        // Use the attribute starts with selector to select elements by ID prefix
        const addPortalButtons = document.querySelectorAll("[id^='addButton']");
        console.log('Number of buttons found:', addPortalButtons.length);

        addPortalButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Get the closest parent with the class 'card'
                const closestCard = this.closest('.card');
                const category = closestCard.dataset.category;
                document.getElementById('addPortalForm').dataset.activeCategory = category;
                document.getElementById('addPortalForm').style.display = 'block';
            });
        });

        const addPortalForm = document.getElementById('addPortalForm');

        if(addPortalForm) {  // Check if the element is not null
            addPortalForm.addEventListener('submit', function(event) {
                event.preventDefault();

                const category = this.dataset.activeCategory;

                const newRow = {
                    portalLink: document.getElementById('portalLink').value,
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value,
                    responsible: document.getElementById('responsible').value
                };

                // Call the function from firestore.js to handle Firestore logic
                submitPortalData(category, newRow);

                // Reset form and hide it after submission
                addPortalForm.reset();
                addPortalForm.style.display = 'none';
            });
        }

        // Handle Close Button Click
        const closeButton = document.querySelector('.close-button');
        if(closeButton) {
            closeButton.addEventListener('click', function() {
                // Hide the form when the close button is clicked
                addPortalForm.style.display = 'none';
            });
        }

        // Load initial data
        loadData("CanadianRegional");
        loadData("CanadianNational");
        loadData("global_international");
        loadData("foreign_national");
        loadData("others_unclassified");
        loadData("regularly_checked");

    }, 2000);  // 2 seconds delay
});


// Copy to clipboard function

function copyToClipboard(textToCopy) {
    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);

    // Select the text and copy it to clipboard
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');

    // Remove the temporary input element
    document.body.removeChild(tempInput);

    // Provide feedback to user (optional)
    alert('Copied to clipboard: ' + textToCopy);
}

// delete row function

function deleteRow(category, rowIndex) {
    db.collection("Portals").doc(category).get().then((doc) => {
        if (doc.exists) {
            let rows = doc.data().rows;
            rows.splice(rowIndex, 1); // Remove the row from the array
            
            // Update the Firestore document
            db.collection("Portals").doc(category).update({
                rows: rows
            }).then(() => {
                loadData(category); // Reload the table data
            }).catch((error) => {
                console.error("Error updating document:", error);
            });
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

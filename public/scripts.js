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
    const tabs = ['home', 'arcgis', 'webapp', 'excel', 'rfp', 'urls', 'data'];
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

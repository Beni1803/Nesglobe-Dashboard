// Assuming firebaseConfig.js initializes Firebase already.

// Constants for timeouts
const MAX_IDLE_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

let idleTimeout;
let sessionTimeout;

// Reset the timer whenever there's user activity
function resetIdleTimeout() {
  if (idleTimeout) clearTimeout(idleTimeout);
  idleTimeout = setTimeout(() => {
    showTimeoutMessage();
    signOut();
  }, MAX_IDLE_TIME);
}

// Set up the listeners to reset the timeout
document.addEventListener('mousemove', resetIdleTimeout);
document.addEventListener('keydown', resetIdleTimeout);

function startSession() {
  if (sessionTimeout) clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(() => {
    showTimeoutMessage();
    signOut();
  }, SESSION_DURATION);
}

// Show a modal or message informing the user why they were logged out
function showTimeoutMessage() {
  displayFeedbackMessage('You have been logged out due to inactivity.', 'alert-warning');
  // Assuming you have a modal set up for this purpose. If not, you can remove the next line.
  $('#timeoutModal').modal('show');
}

// Toggle logic
document.querySelectorAll('input[name="signInMethod"]').forEach(input => {
  input.addEventListener('change', function() {
    if (this.value === 'emailPassword') {
      document.getElementById('emailPasswordFormModal').style.display = 'block';
    } else {
      document.getElementById('emailPasswordFormModal').style.display = 'none';
    }
  });
});

function checkAuthentication() {
  const user = firebase.auth().currentUser;
  if (!user) {
    $('#loginModal').modal('show');
  }
}

firebase.auth().onAuthStateChanged(user => {
  const userInfoModal = document.getElementById('userInfoModal');

  if (user) {
    // User is signed in
    userInfoModal.style.display = 'inline';
    userInfoModal.textContent = user.email;
    document.getElementById('signOutButtonModal').style.display = 'block';
    document.getElementById('dashboardContent').style.display = 'block';
    $('#loginModal').modal('hide');

    // Start or renew the session timer
    startSession();
  } else {
    // User is signed out
    userInfoModal.style.display = 'none';
    document.getElementById('signOutButtonModal').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'none';
    $('#loginModal').modal('show');
  }
});

function signInWithEmail() {
  const email = document.getElementById('emailFieldModal').value;
  const password = document.getElementById('passwordFieldModal').value;

  // Clear any previous messages
  clearFeedbackArea();

  // Perform client-side form validation
  if (!email || !password) {
    displayFeedbackMessage('Please enter both email and password.', 'alert-warning');
    return;
  }

  // Add a loading indicator
  displayFeedbackMessage('Signing in...', 'alert-info');

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(result => {
      // Clear loading indicator and show success message
      clearFeedbackArea();
      console.log('User signed in with Email and Password successfully!');
    })
    .catch(error => {
      // Clear loading indicator and display error message
      clearFeedbackArea();
      console.error('Error during Email and Password sign-in:', error.message);
      displayFeedbackMessage('Sign-in failed. Please check your credentials.', 'alert-danger');
    });
}

// Function to sign out
function signOut() {
  if (sessionTimeout) clearTimeout(sessionTimeout);
  if (idleTimeout) clearTimeout(idleTimeout);
  
  firebase.auth().signOut()
    .then(() => {
      console.log('User signed out successfully!');
    })
    .catch(error => {
      console.error('Error during sign-out:', error.message);
      displayFeedbackMessage('Sign-out failed. Please try again.', 'alert-danger');
    });
}

// Function to reset the password
function resetPassword(email) {
  if (!email) {
    // Display a message to the user to enter an email.
    displayFeedbackMessage('Please enter your email before resetting your password.', 'alert-warning');
    return;
  }

  // Clear any previous messages.
  clearFeedbackArea();

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      console.log('Password reset email sent successfully.');
      // Display a success message to the user.
      displayFeedbackMessage('Password reset email sent successfully. Check your inbox.', 'alert-success');
    })
    .catch(error => {
      console.error('Error sending password reset email:', error.message);
      // Handle the error and display it to the user.
      displayFeedbackMessage('An error occurred: ' + error.message, 'alert-danger');
    });
}

// Function to display feedback messages
function displayFeedbackMessage(message, className) {
  const feedbackArea = document.getElementById('feedbackArea');
  feedbackArea.textContent = message;
  feedbackArea.classList.remove('alert-danger', 'alert-success', 'alert-warning');
  feedbackArea.classList.add(className);
  feedbackArea.style.display = 'block';
}

// Function to clear the feedback area
function clearFeedbackArea() {
  const feedbackArea = document.getElementById('feedbackArea');
  feedbackArea.textContent = '';
  feedbackArea.style.display = 'none';
}

// Real-time email validation
document.getElementById('emailFieldModal').addEventListener('input', function () {
  const email = this.value.trim();
  const isValidEmail = validateEmail(email);
  if (!isValidEmail) {
    displayFeedbackMessage('Please enter a valid email address.', 'alert-warning');
  } else {
    clearFeedbackArea();
  }
});

document.addEventListener("DOMContentLoaded", function() {
  // Email validation function
  function validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
  }

  // Add event listener for the "Forgot/Reset Password" link
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', function(event) {
          event.preventDefault(); // Prevent the default link behavior.
          const email = document.getElementById('emailFieldModal').value;
          resetPassword(email);
      });
  }

  // Event listeners for buttons
  const signInWithEmailButtonModal = document.getElementById('signInWithEmailButtonModal');
  if (signInWithEmailButtonModal) {
      signInWithEmailButtonModal.addEventListener('click', signInWithEmail);
  }

  const signOutButtonModal = document.getElementById('signOutButtonModal');
  if (signOutButtonModal) {
      signOutButtonModal.addEventListener('click', signOut);
  }

  // Function to toggle password visibility
  const passwordVisibilityToggle = document.getElementById('passwordVisibilityToggle');
  if (passwordVisibilityToggle) {
      passwordVisibilityToggle.addEventListener('click', function() {
          const passwordField = document.getElementById('passwordFieldModal');
          if (passwordField.type === 'password') {
              passwordField.type = 'text';
          } else {
              passwordField.type = 'password';
          }
      });
  }

  setupDashboardLinks();
});

function setupDashboardLinks() {
  const links = document.querySelectorAll('.list-group-item-action');
  links.forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();  // Prevent the default behavior
          loadDashboard(this.getAttribute('data-url'));
      });
  });
}

function loadDashboard(url) {
  window.open(url, '_blank');
}


document.addEventListener("DOMContentLoaded", function() {
  const tabs = ['home', 'arcgis', 'webapp', 'excel', 'rfp', 'urls'];

  tabs.forEach(tab => {
      fetch(`${tab}_tab_content.html`)
      .then(response => response.text())
      .then(data => {
          const tabContainer = document.querySelector(`#${tab}`);
          tabContainer.innerHTML = data;
      });
  });
});

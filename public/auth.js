// Assuming firebaseConfig.js initializes Firebase already.

const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
let sessionTimeout;

// Start or renew the session timer
function startSession() {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        showTimeoutMessage(); // This function might reside in mainLogic.js
        signOut();
    }, SESSION_DURATION);
}

// Function to sign in using email and password
function signInWithEmail() {
    console.log('signInWithEmail called');
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

    // Clear any previous messages
    clearFeedbackArea();

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            console.log('Password reset email sent successfully.');
            // Display a success message to the user
            displayFeedbackMessage('Password reset email sent successfully. Check your inbox.', 'alert-success');
        })
        .catch(error => {
            console.error('Error sending password reset email:', error.message);
            // Handle the error and display it to the user
            displayFeedbackMessage('An error occurred: ' + error.message, 'alert-danger');
        });
}

// Firebase Auth State Change Listener
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
        startSession(); // Assuming startSession is in mainLogic.js, you may need to adjust the division
    } else {
        // User is signed out
        userInfoModal.style.display = 'none';
        document.getElementById('signOutButtonModal').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'none';
        $('#loginModal').modal('show');
    }
});

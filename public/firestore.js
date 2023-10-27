// Firestore Configuration
function checkUserAuthentication() {
    // Listen to authentication state changes.
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            console.log('User is signed in:', user.email);
            // Here you can take further actions if the user is logged in.
            // Like, showing user-specific content, navigating to a dashboard, etc.
        } else {
            // User is signed out
            console.log('User is signed out.');
            // Here you can navigate to the login page, or show a message to the user
        }
    });
}

// Initialization
checkUserAuthentication();
// Connect to Firestore

// Load RFP data when the page loads
document.addEventListener("DOMContentLoaded", function() {
    loadRFPData();
});

function loadRFPData() {
    // Get reference to the RFP_Sources collection
    const rfpSourcesRef = db.collection("RFP_Sources");

    // Fetch data from Firestore
    rfpSourcesRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const categoryName = doc.id; // e.g., CanadianRegional
            const categoryData = doc.data();

            // Find the correct table body for this category
            const tbody = document.querySelector(`.filterable-content[data-category="${categoryName}"] tbody`);

            // Populate table with data
            for (let portal of categoryData.portals) {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${portal.link}</td>
                    <td>${portal.username}</td>
                    <td>${portal.password}</td>
                    <td>${portal.responsible}</td>
                `;
                tbody.appendChild(row);
            }
        });
    }).catch((error) => {
        console.error("Error getting RFP data from Firestore:", error);
    });
}
// Function to create a new portal row
function addPortal(categoryName) {
    const tbody = document.querySelector(`.filterable-content[data-category="${categoryName}"] tbody`);

    // Create a new row element
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>PORTAL_LINK</td>
        <td>USERNAME</td>
        <td>PASSWORD</td>
        <td>RESPONSIBLE</td>
    `;

    // Append the row to the portal table
    tbody.appendChild(row);
}

// Event listener for adding a new portal row
document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("custom-btn") && e.target.textContent === "Add Portal") {
        const categoryName = e.target.closest(".card").getAttribute("data-category");
        addPortal(categoryName);
    }
});

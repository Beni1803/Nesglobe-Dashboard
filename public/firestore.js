function checkUserAuthentication() {
    auth.onAuthStateChanged(user => {
        console.log(user ? `User is signed in: ${user.email}` : 'User is signed out.');
    });
}

function populateRFPDataToTable(categoryName, portals) {
    const tbody = document.querySelector(`.tab-card[data-category="Tab${categoryName}"] tbody`);

    if (!tbody) {
        console.error(`Table body element for category ${categoryName} not found.`);
        return;
    }

    tbody.innerHTML = ''; // clear existing data

    portals.forEach(portal => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${portal.link}</td>
            <td>${portal.username}</td>
            <td>${portal.password}</td>
            <td>${portal.responsible}</td>
        `;
        tbody.appendChild(row);
    });
}

function loadRFPData() {
    db.collection("RFP_Sources").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            populateRFPDataToTable(doc.id, doc.data().portals);
        });
    }).catch(error => {
        console.error("Error getting RFP data from Firestore:", error);
    });
}

function submitPortalData() {
    const portalLinkInput = document.getElementById("portalLink");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const responsibleInput = document.getElementById("responsible");

    const portalData = {
        link: portalLinkInput.value,
        username: usernameInput.value,
        password: passwordInput.value,
        responsible: responsibleInput.value
    };

    const submitPortalButton = document.getElementById("submitPortal");
    const currentCategory = submitPortalButton.getAttribute("data-category");
    const rfpSourcesRef = db.collection("RFP_Sources").doc(currentCategory);

    rfpSourcesRef.update({
        portals: firebase.firestore.FieldValue.arrayUnion(portalData)
    }).then(() => {
        console.log("Document successfully updated!");
        loadRFPData();
    }).catch(error => {
        console.error("Error updating document:", error);
    });

    $("#addPortalModal").modal('hide');
}

function showAddPortalModal(event) {
    const category = event.target.closest(".tab-card").getAttribute("data-category");

    // Clear input values
    const portalLinkInput = document.getElementById("tabPortalLink");
    const usernameInput = document.getElementById("tabUsername");
    const passwordInput = document.getElementById("tabPassword");
    const responsibleInput = document.getElementById("tabResponsible");

    portalLinkInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";
    responsibleInput.value = "";

    const submitPortalButton = document.getElementById("submitPortal");
    submitPortalButton.setAttribute("data-category", category);

    $("#addTabPortalModal").modal('show');
}


document.addEventListener("DOMContentLoaded", function() {
    loadRFPData();
    checkUserAuthentication();

    const submitPortalButton = document.getElementById("submitPortal");
    if (submitPortalButton) {
        submitPortalButton.addEventListener("click", submitPortalData);
    }

    // Event delegation for add buttons
    document.addEventListener("click", event => {
        if (event.target.classList.contains("tab-btn")) {
            showAddPortalModal(event);
        }
    });
});

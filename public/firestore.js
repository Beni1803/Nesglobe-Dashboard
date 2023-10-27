function checkUserAuthentication() {
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('User is signed in:', user.email);
        } else {
            console.log('User is signed out.');
        }
    });
}

function loadRFPData() {
    const rfpSourcesRef = db.collection("RFP_Sources");
    rfpSourcesRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const categoryName = doc.id;
            const categoryData = doc.data();
            const tbody = document.querySelector(`.filterable-content[data-category="${categoryName}"] tbody`);
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

function attachSubmitButtonListener() {
    $('#addPortalModal').on('shown.bs.modal', function() {
        const submitBtn = document.getElementById("submitPortal");
        submitBtn.addEventListener("click", submitPortalData);
    });
}

function submitPortalData() {
    const portalLink = document.getElementById("portalLink").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value; // Remember about password security.
    const responsible = document.getElementById("responsible").value;

    const newPortal = {
        link: portalLink,
        username: username,
        password: password,
        responsible: responsible
    };

    const currentCategory = this.getAttribute("data-category");
    const rfpSourcesRef = db.collection("RFP_Sources").doc(currentCategory);
    
    rfpSourcesRef.update({
        portals: firebase.firestore.FieldValue.arrayUnion(newPortal)
    }).then(() => {
        console.log("Document successfully updated!");
        loadRFPData();
    }).catch((error) => {
        console.error("Error updating document: ", error);
    });

    $("#addPortalModal").modal('hide');
}

function addPortal(categoryName) {
    const submitBtn = document.getElementById("submitPortal");
    submitBtn.setAttribute("data-category", categoryName);
    document.getElementById("portalLink").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("responsible").value = "";

    $("#addPortalModal").modal('show');
}

function setupAddPortalEventListener() {
    const addButtons = document.querySelectorAll(".custom-btn");
    addButtons.forEach(button => {
        if (button.textContent === "Add Portal") {
            button.addEventListener("click", function() {
                const categoryName = button.closest(".card").getAttribute("data-category");
                addPortal(categoryName);
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    loadRFPData();
    attachSubmitButtonListener();
    setupAddPortalEventListener();
    checkUserAuthentication();
});

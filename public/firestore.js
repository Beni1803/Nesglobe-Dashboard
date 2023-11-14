// Function to load data from Firestore
function simplifyURL(url) {
    const urlObject = new URL(url);
    // Get hostname and remove 'www.' if present
    const simplifiedName = urlObject.hostname.replace(/^www\./, '');
    return simplifiedName;
}

function loadData(category) {
    db.collection("Portals").doc(category).get().then((doc) => {
        let content = '';
        if (doc.exists) {
            const dataArray = doc.data().rows;
            if (dataArray && Array.isArray(dataArray)) {
                dataArray.forEach((data, index) => {
                    const simplifiedName = simplifyURL(data.portalLink);
                    content += `
                        <tr>
                            <td><a href="${data.portalLink}" target="_blank">${simplifiedName}</a></td>
                            <td>${data.username} <i class="fas fa-copy copy-icon" onclick="copyToClipboard('${data.username}')"></i></td>
                            <td>${data.password} <i class="fas fa-copy copy-icon" onclick="copyToClipboard('${data.password}')"></i></td>
                            <td>${data.responsible}</td>
                            <td><i class="fas fa-trash-alt delete-icon" onclick="openDeleteModal('${category}', ${index})"></i></td>
                        </tr>
                    `;
                });                
            }
        } else {
            console.log("No such document:", category);
        }
        document.getElementById(`portalData${category}`).innerHTML = content;
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

function submitPortalData(category, newRow) {
    // Logic to update the Firestore document
    db.collection("Portals").doc(category).update({
        rows: firebase.firestore.FieldValue.arrayUnion(newRow)
    }).then(() => {
        loadData(category);
    }).catch((error) => {
        console.error("Error updating document:", error);
    });
}

function openDeleteModal(category, rowIndex) {
    $('#deleteConfirmModal').modal('show');

    // Set click event on the confirm delete button
    $('#confirmDelete').off('click').on('click', function() {
        deleteRow(category, rowIndex);
        $('#deleteConfirmModal').modal('hide');
    });
}

function deleteRow(category, rowIndex) {
    db.collection("Portals").doc(category).get().then((doc) => {
        if (doc.exists) {
            const dataArray = doc.data().rows;
            dataArray.splice(rowIndex, 1); // Removes the row from the array
            return db.collection("Portals").doc(category).update({rows: dataArray});
        }
    }).then(() => {
        loadData(category);
    }).catch((error) => {
        console.error("Error deleting row:", error);
    });
}

// Function to load network resources from Firestore and display them
function loadNetworkResources(docType) {
    db.collection("networksdata").doc(docType).get().then((doc) => {
        let content = '';
        if (doc.exists) {
            const resourcesArray = doc.data().resources;
            if (resourcesArray && Array.isArray(resourcesArray)) {
                resourcesArray.forEach((resource, index) => {
                    content += `
                        <div class="sharepoint-link">
                            <a href="${resource.link}" target="_blank" rel="noopener noreferrer">
                                <i class="fas fa-external-link-alt"></i> ${resource.label}
                            </a>
                            <i class="fas fa-edit" onclick="openResourceModal('edit', ${index}, '${docType}')"></i>
                            <i class="fas fa-trash-alt" onclick="deleteResource(${index}, '${docType}')"></i>
                        </div>
                    `;
                });
            }
        } else {
            console.log(`No such document: ${docType}`);
        }
        document.getElementById(docType + 'Container').innerHTML = content;
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

// Function to open modal for adding or editing a resource
function openResourceModal(mode, index, docType) {
    // Reset the form values
    document.getElementById('resourceLabel').value = '';
    document.getElementById('resourceLink').value = '';
    document.getElementById('resourceId').value = '';
    document.getElementById('docType').value = docType; // Store the document type

    if (mode === 'edit') {
        // Load the current data into the modal fields
        db.collection("networksdata").doc(docType).get().then((doc) => {
            if (doc.exists) {
                const resource = doc.data().resources[index];
                document.getElementById('resourceLabel').value = resource.label;
                document.getElementById('resourceLink').value = resource.link;
                document.getElementById('resourceId').value = index;
            }
        });
    }

    $('#resourceModal').modal('show');
}

// Function to save a new or edited resource
function saveResource() {
    const label = document.getElementById('resourceLabel').value;
    const link = document.getElementById('resourceLink').value;
    const index = document.getElementById('resourceId').value;
    const docType = document.getElementById('docType').value; // Retrieve the document type

    const resource = { label, link };

    if (index !== '') {
        // Edit an existing resource
        db.collection("networksdata").doc(docType).get().then((doc) => {
            if (doc.exists) {
                let resourcesArray = doc.data().resources;
                resourcesArray[index] = resource;
                return db.collection("networksdata").doc(docType).update({resources: resourcesArray});
            }
        }).then(() => {
            loadNetworkResources(docType);
            $('#resourceModal').modal('hide');
        }).catch((error) => {
            console.error("Error updating resource:", error);
        });
    } else {
        // Add a new resource
        db.collection("networksdata").doc(docType).update({
            resources: firebase.firestore.FieldValue.arrayUnion(resource)
        }).then(() => {
            loadNetworkResources(docType);
            $('#resourceModal').modal('hide');
        }).catch((error) => {
            console.error("Error adding resource:", error);
        });
    }
}
// Function to delete a resource
function deleteResource(index, docType) {
    db.collection("networksdata").doc(docType).get().then((doc) => {
        if (doc.exists) {
            let resourcesArray = doc.data().resources;
            resourcesArray.splice(index, 1);
            return db.collection("networksdata").doc(docType).update({resources: resourcesArray});
        }
    }).then(() => {
        loadNetworkResources(docType);
    }).catch((error) => {
        console.error("Error deleting resource:", error);
    });
}

// Call loadNetworkResources for both types on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNetworkResources('networks_excel_resources');
    loadNetworkResources('networks_online_resources');
});
// Function to load data from Firestore
function loadData(category) {
    db.collection("Portals").doc(category).get().then((doc) => {
        let content = '';
        if (doc.exists) {
            const dataArray = doc.data().rows;
            if (dataArray && Array.isArray(dataArray)) {
                dataArray.forEach((data, index) => {
                    content += `
                        <tr>
                            <td><a href="${data.portalLink}" target="_blank">${data.portalLink}</a></td>
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
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
// --------------------------------------------------------------------
//         networks resources database handling
// --------------------------------------------------------------------
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
// Function to delete a resource with verification
function deleteResource(index, docType) {
    // Confirmation dialog
    if (confirm("Are you sure you want to delete this resource?")) {
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
    } else {
        console.log("Deletion cancelled.");
    }
}

// Call loadNetworkResources for both types on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNetworkResources('networks_excel_resources');
    loadNetworkResources('networks_online_resources');
});

// --------------------------------------------------------------------
//         Economics resources database handling
// --------------------------------------------------------------------

// Function to load economic resources from Firestore and display them
function loadEconomicResources(docType) {
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
                            <i class="fas fa-edit" onclick="openEconomicsModal('edit', ${index}, '${docType}')"></i>
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
function openEconomicsModal(mode, index, docType) {
    // Reset the form values
    document.getElementById('economicsLabel').value = '';
    document.getElementById('economicsLink').value = '';
    document.getElementById('economicsId').value = '';
    document.getElementById('economicsDocType').value = docType; // Store the document type

    if (mode === 'edit') {
        // Load the current data into the modal fields
        db.collection("networksdata").doc(docType).get().then((doc) => {
            if (doc.exists) {
                const resource = doc.data().resources[index];
                document.getElementById('economicsLabel').value = resource.label;
                document.getElementById('economicsLink').value = resource.link;
                document.getElementById('economicsId').value = index;
            }
        });
    }

    $('#economicsModal').modal('show');
}

// Function to save a new or edited resource
function saveEconomics() {
    const label = document.getElementById('economicsLabel').value;
    const link = document.getElementById('economicsLink').value;
    const index = document.getElementById('economicsId').value;
    const docType = document.getElementById('economicsDocType').value; // Retrieve the document type

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
            loadEconomicResources(docType);
            $('#economicsModal').modal('hide');
        }).catch((error) => {
            console.error("Error updating resource:", error);
        });
    } else {
        // Add a new resource
        db.collection("networksdata").doc(docType).update({
            resources: firebase.firestore.FieldValue.arrayUnion(resource)
        }).then(() => {
            loadEconomicResources(docType);
            $('#economicsModal').modal('hide');
        }).catch((error) => {
            console.error("Error adding resource:", error);
        });
    }
}

// Function to delete a resource with verification
function deleteEconomics(index, docType) {
    // Confirmation dialog
    if (confirm("Are you sure you want to delete this source?")) {
        db.collection("networksdata").doc(docType).get().then((doc) => {
            if (doc.exists) {
                let resourcesArray = doc.data().resources;
                resourcesArray.splice(index, 1);
                return db.collection("networksdata").doc(docType).update({resources: resourcesArray});
            }
        }).then(() => {
            loadEconomicResources(docType);
        }).catch((error) => {
            console.error("Error deleting resource:", error);
        });
    } else {
        console.log("Deletion cancelled.");
    }
}

// Call loadEconomicResources for both types on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEconomicResources('economics_canadian_data');
    loadEconomicResources('economics_international_data');
});
// --------------------------------------------------------------------
//         Strategy resources database handling
// --------------------------------------------------------------------

// Function to load strategy resources from Firestore and display them
function loadStrategyResources(docType) {
    console.log("Called loadStrategyResources for: ", docType); // Debug log

    let containerId;
    if (docType === 'strategy_auctions') {
        containerId = 'strategy_auctionsContainer';
    } else if (docType === 'strategy_regulatory') {
        containerId = 'strategy_regulatoryContainer';
    }

    console.log("Target container ID: ", containerId); // Debug log

    db.collection("networksdata").doc(docType).get().then((doc) => {
        let content = '';
        if (doc.exists) {
            const resourcesArray = doc.data().resources;
            resourcesArray.forEach((resource, index) => {
                content += `
                    <div class="sharepoint-link">
                        <a href="${resource.link}" target="_blank" rel="noopener noreferrer">
                            <i class="fas fa-external-link-alt"></i> ${resource.label}
                        </a>
                        <i class="fas fa-edit" onclick="openStrategyModal('edit', ${index}, '${docType}')"></i>
                        <i class="fas fa-trash-alt" onclick="deleteStrategy(${index}, '${docType}')"></i>
                    </div>
                `;
            });
            document.getElementById(containerId).innerHTML = content;
        } else {
            console.log(`No such document: ${docType}`);
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });    
}

// Function to open modal for adding or editing a strategy resource
function openStrategyModal(mode, index, docType) {
    // Reset the form values
    document.getElementById('strategyLabel').value = '';
    document.getElementById('strategyLink').value = '';
    document.getElementById('strategyId').value = '';
    document.getElementById('strategyDocType').value = docType; // Store the document type

    if (mode === 'edit') {
        // Load the current data into the modal fields
        db.collection("networksdata").doc(docType).get().then((doc) => {
            if (doc.exists) {
                const resource = doc.data().resources[index];
                document.getElementById('strategyLabel').value = resource.label;
                document.getElementById('strategyLink').value = resource.link;
                document.getElementById('strategyId').value = index;
            }
        });
    }

    $('#strategyModal').modal('show');
}

// Function to save a new or edited strategy resource
function saveStrategy() {
    const label = document.getElementById('strategyLabel').value;
    const link = document.getElementById('strategyLink').value;
    const index = document.getElementById('strategyId').value;
    const docType = document.getElementById('strategyDocType').value; // Retrieve the document type

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
            loadStrategyResources(docType);
            $('#strategyModal').modal('hide');
        }).catch((error) => {
            console.error("Error updating resource:", error);
        });
    } else {
        // Add a new resource
        db.collection("networksdata").doc(docType).update({
            resources: firebase.firestore.FieldValue.arrayUnion(resource)
        }).then(() => {
            loadStrategyResources(docType);
            $('#strategyModal').modal('hide');
        }).catch((error) => {
            console.error("Error adding resource:", error);
        });
    }
}

// Function to delete a strategy resource with verification
function deleteStrategy(index, docType) {
    // Confirmation dialog
    if (confirm("Are you sure you want to delete this resource?")) {
        db.collection("networksdata").doc(docType).get().then((doc) => {
            if (doc.exists) {
                let resourcesArray = doc.data().resources;
                resourcesArray.splice(index, 1);
                return db.collection("networksdata").doc(docType).update({resources: resourcesArray});
            }
        }).then(() => {
            loadStrategyResources(docType);
        }).catch((error) => {
            console.error("Error deleting resource:", error);
        });
    } else {
        console.log("Deletion cancelled.");
    }
}

// Call loadStrategyResources for specific types on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStrategyResources('strategy_auctions');
    loadStrategyResources('strategy_regulatory');
});


// --------------------------------------------------------------------
//                        Projects progress
// --------------------------------------------------------------------
// Function to calculate progress percentage
function updateOrInsertProgressBar(projectId, projectData) {
    // Check if we have valid project data to work with
    if (!projectData || typeof projectData !== 'object' || !projectData.startdate || !projectData.enddate) {
        console.error(`Project data for '${projectId}' is missing or incorrectly formatted.`);
        return; // Exit the function if the data is not valid
    }

    // Extract and convert Firestore Timestamps to JavaScript Date objects
    let startDate, endDate;
    try {
        startDate = new Date(projectData.startdate.seconds * 1000);
        endDate = new Date(projectData.enddate.seconds * 1000);
    } catch (error) {
        console.error(`Error reading dates for project '${projectId}':`, error);
        return; // Exit the function if there's an error
    }

    // Calculate the progress percentage
    const progressPercentage = calculateProgressPercentage(startDate, endDate);
    const progressBarColor = getProgressColor(startDate, endDate);

    // Get or create the container for the project's progress bar
    const projectList = document.getElementById('project-list');
    let projectContainer = document.getElementById(`project-container-${projectId}`);
    if (!projectContainer) {
        projectContainer = document.createElement('div');
        projectContainer.id = `project-container-${projectId}`;
        projectContainer.className = 'project-container';
        projectList.appendChild(projectContainer);
    }
// Set the innerHTML with project details and progress bar
projectContainer.innerHTML = `
    <div class="card">
        <div class="card-header">
            <h5 class="card-title">${projectData.projectname}</h5>
            <small class="text-muted">${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</small>
        </div>
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
                <div class="progress flex-grow-1 mr-3">
                    <div id="progress-bar-${projectId}" class="progress-bar ${progressBarColor}" role="progressbar" 
                        style="width: ${progressPercentage}%" aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100">
                        ${progressPercentage.toFixed(2)}%
                    </div>
                </div>
                <button type="button" class="btn btn-primary btn-sm mr-2" onclick="modifyProject('${projectId}')" data-toggle="tooltip" data-placement="top" title="Edit Project">
                <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteProject('${projectId}')" data-toggle="tooltip" data-placement="top" title="Delete Project">
                    <i class="fas fa-trash-alt"></i>
                </button>            
            </div>
        </div>
    </div>
`;
}

// Function to calculate progress percentage
function calculateProgressPercentage(startDate, endDate) {
    const now = new Date();
    if (now < startDate) {
        return 0; // Project has not started yet
    }
    const elapsed = now - startDate;
    const total = endDate - startDate;
    return Math.min(100, (elapsed / total) * 100);
}

// Function to determine progress bar color based on percentage
function getProgressColor(startDate, endDate) {
    const progressPercentage = calculateProgressPercentage(startDate, endDate);

    if (progressPercentage < 33.33) {
        return 'bg-success'; // Green for less than 33.33%
    } else if (progressPercentage < 66.67) {
        return 'bg-warning'; // Yellow for less than 66.67%
    } else {
        return 'bg-danger'; // Red for 66.67% and above
    }
}

// Function to modify a project
function modifyProject(projectId) {
    // Retrieve the project data from Firestore
    const db = firebase.firestore();
    db.collection("projects").doc("progress").get().then(doc => {
        if (doc.exists && doc.data()[projectId]) {
            const projectData = doc.data()[projectId];
            // Assuming you have form fields with these IDs
            document.getElementById('projectName').value = projectData.projectname;
            document.getElementById('projectStartDate').value = projectData.startdate.toDate().toISOString().split('T')[0];
            document.getElementById('projectEndDate').value = projectData.enddate.toDate().toISOString().split('T')[0];
            document.getElementById('projectId').value = projectId;
            // Show the modal for editing
            $('#projectModal').modal('show');
        } else {
            console.error(`Project with ID ${projectId} does not exist.`);
        }
    }).catch(error => {
        console.error("Error fetching project to modify:", error);
    });
}

// Function to delete a project
function deleteProject(projectId) {
    // Ask for confirmation before deletion
    if (confirm(`Are you sure you want to delete the project "${projectId}"?`)) {
        const db = firebase.firestore();
        // Create an update object to remove the project field
        const projectUpdate = {};
        projectUpdate[projectId] = firebase.firestore.FieldValue.delete();
        // Update the document to remove the project
        db.collection("projects").doc("progress").update(projectUpdate).then(() => {
            console.log(`Project ${projectId} deleted successfully.`);
            // Remove the project container from the UI
            const projectContainer = document.getElementById(`project-container-${projectId}`);
            if (projectContainer) {
                projectContainer.remove();
            }
        }).catch(error => {
            console.error("Error deleting project:", error);
        });
    }
}

// Function to fetch project progress from Firestore and update the UI
function fetchAndDisplayAllProjects() {
    const db = firebase.firestore();
    const projectDocRef = db.collection("projects").doc("progress");
    projectDocRef.get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            for (const projectId in data) {
                const projectData = data[projectId];
                // Ensure the projectData contains the expected fields
                if (projectData && projectData.startdate && projectData.enddate) {
                    const startDate = projectData.startdate.toDate();
                    const endDate = projectData.enddate.toDate();
                    const status = projectData.status;
                    const progressPercentage = calculateProgressPercentage(startDate, endDate);
                    updateOrInsertProgressBar(projectId, projectData, progressPercentage, status);
                } else {
                    console.error(`Project data for '${projectId}' is missing 'startdate' or 'enddate' fields.`);
                }
            }
        } else {
            console.log("Document 'progress' not found!");
        }
    }).catch(error => {
        console.error("Error fetching project progress:", error);
    });
}

// Adjusted function to save a new project
function saveProject() {
    const db = firebase.firestore();
    const projectNameInput = document.getElementById('projectName');
    const projectStartDateInput = document.getElementById('projectStartDate');
    const projectEndDateInput = document.getElementById('projectEndDate');
    const projectIdInput = document.getElementById('projectId'); // Hidden input field for project ID

    // Check if we're updating an existing project or creating a new one
    const isUpdatingProject = projectIdInput && projectIdInput.value;

    const projectId = isUpdatingProject ? projectIdInput.value : generateProjectId(projectNameInput.value);
    const projectData = {
        projectname: projectNameInput.value,
        startdate: firebase.firestore.Timestamp.fromDate(new Date(projectStartDateInput.value)),
        enddate: firebase.firestore.Timestamp.fromDate(new Date(projectEndDateInput.value)),
        status: 'In Progress' // Default status, update as needed
    };

    // Create an update object for Firestore
    const projectUpdate = {};
    projectUpdate[projectId] = projectData;

    // Set or merge the project data in the 'progress' document
    db.collection("projects").doc("progress").set(projectUpdate, { merge: true })
        .then(() => {
            console.log(isUpdatingProject ? "Project updated successfully!" : "New project added successfully!");
            fetchAndDisplayAllProjects(); // Refresh the project list
            $('#projectModal').modal('hide'); // Hide the modal
        })
        .catch(error => {
            console.error("Error saving project:", error);
        });
}

// Generate a unique ID for a new project
function generateProjectId(projectName) {
    return projectName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
}

// Call fetchAndDisplayAllProjects on page load to display all projects
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for the "Save Project" button
    const saveButton = document.getElementById('saveProjectButton');
    if (saveButton) {
        saveButton.addEventListener('click', saveProject);
    }

    // Fetch and display all projects
    fetchAndDisplayAllProjects();
});
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
// Helper function to calculate days passed since the project started
function calculateDaysPassed(startDate) {
    const now = new Date();
    const startDateStr = startDate + 'T00:00:00Z'; // Convert to UTC date string

    if (now < new Date(startDateStr)) {
        return '0 days';
    }

    const timeDifference = now - new Date(startDateStr);
    const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return `${daysPassed} days`;
}

// Helper function to calculate days left until the project ends
function calculateDaysLeft(endDate) {
    const now = new Date();
    const endDateStr = endDate + 'T23:59:59Z'; // Convert to UTC date string

    if (now > new Date(endDateStr)) {
        return '0 days';
    }

    const timeDifference = new Date(endDateStr) - now;
    const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include the end date
    return `${daysLeft} days`;
}

// Function to calculate progress percentage based on date strings
function calculateProgressPercentage(startDate, endDate) {
    const now = new Date();
    const startDateObj = new Date(startDate + 'T00:00:00');
    const endDateObj = new Date(endDate + 'T23:59:59');

    console.log('Now:', now);
    console.log('Start Date:', startDateObj);
    console.log('End Date:', endDateObj);

    // Check if the current date is before the start date
    if (now < startDateObj) {
        console.log('Progress: 0% (before start date)');
        return 0;
    }

    // Check if the current date is after the end date
    if (now > endDateObj) {
        console.log('Progress: 100% (after end date)');
        return 100;
    }

    // Calculate the total project duration and the elapsed time
    const totalDuration = endDateObj - startDateObj;
    const elapsed = now - startDateObj;
    
    console.log('Total Duration (ms):', totalDuration);
    console.log('Elapsed (ms):', elapsed);

    // Calculate the progress percentage
    const progress = (elapsed / totalDuration) * 100;

    console.log('Progress:', progress);

    // Clamp the progress between 0 and 100 before returning
    return Math.min(Math.max(progress, 0), 100);
}

function updateOrInsertProgressBar(projectId, projectData) {
    if (!projectData || typeof projectData !== 'object' || !projectData.startdate || !projectData.enddate) {
        console.error(`Project data for '${projectId}' is missing or incorrectly formatted.`);
        return;
    }

    // Calculate days passed, days left, and progress percentage
    const daysPassed = calculateDaysPassed(projectData.startdate);
    const daysLeft = calculateDaysLeft(projectData.enddate);
    const progressPercentage = calculateProgressPercentage(projectData.startdate, projectData.enddate);

    const progressBarColor = getProgressColor(progressPercentage);
    const projectList = document.getElementById('project-list');
    let projectContainer = document.getElementById(`project-container-${projectId}`);
    if (!projectContainer) {
        projectContainer = document.createElement('div');
        projectContainer.id = `project-container-${projectId}`;
        projectContainer.className = 'project-container';
        projectList.appendChild(projectContainer);
    }

    projectContainer.innerHTML = `
    <div class="card" style="padding: 0.5rem;">
        <div class="card-header d-flex justify-content-between align-items-center" style="padding-bottom: 0;">
            <div>
                <h5 class="card-title mb-0">${projectData.projectname}</h5>
                <small class="text-muted">${projectData.startdate} - ${projectData.enddate}</small>
            </div>
            <div>
                <span class="badge badge-info">${daysPassed} days passed</span>
                <span class="badge badge-warning">${daysLeft} days left</span>
            </div>
        </div>
        <div class="card-body" style="padding-top: 0.25rem; padding-bottom: 0.25rem;">
            <p class="card-text" style="margin-bottom: 0.5rem;">${projectData.description || 'No description provided.'}</p>
            <div class="progress-wrapper d-flex align-items-center">
                <div class="progress flex-grow-1" style="margin-right: 0.5rem;">
                    <div id="progress-bar-${projectId}" class="progress-bar ${progressBarColor}" role="progressbar"
                        style="width: ${progressPercentage.toFixed(2)}%" aria-valuenow="${progressPercentage}" aria-valuemin="0" aria-valuemax="100">
                        ${progressPercentage.toFixed(2)}%
                    </div>
                </div>
                <button type="button" class="btn btn-primary btn-sm" onclick="modifyProject('${projectId}')" data-toggle="tooltip" data-placement="top" title="Edit Project" style="padding: 0.25rem 0.5rem;">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="deleteProject('${projectId}')" data-toggle="tooltip" data-placement="top" title="Delete Project" style="padding: 0.25rem 0.5rem;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        </div>
    </div>
    `;
}

// Function to determine progress bar color based on percentage
function getProgressColor(progressPercentage) {
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

            // Convert the startdate and enddate from the project data to Date objects
            const startDate = new Date(projectData.startdate);
            const endDate = new Date(projectData.enddate);

            // Format dates as 'YYYY-MM-DD' for the input fields
            const formattedStartDate = startDate.toISOString().split('T')[0];
            const formattedEndDate = endDate.toISOString().split('T')[0];

            // Set the value of form fields
            document.getElementById('projectName').value = projectData.projectname;
            document.getElementById('projectStartDate').value = formattedStartDate;
            document.getElementById('projectEndDate').value = formattedEndDate;
            document.getElementById('projectId').value = projectId;
            document.getElementById('projectDescription').value = projectData.description || '';
            
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
                    updateOrInsertProgressBar(projectId, projectData);
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

function clearProjectForm() {
    document.getElementById('projectForm').reset(); // This resets the form to its initial state
    document.getElementById('projectId').value = ''; // Ensure the hidden projectId is cleared
    document.getElementById('projectDescription').value = ''; // Clear the description textarea
}
// Adjusted function to save a new project
function saveProject() {
    const db = firebase.firestore();
    const projectNameInput = document.getElementById('projectName').value.trim();
    const projectStartDateInput = document.getElementById('projectStartDate').value;
    const projectEndDateInput = document.getElementById('projectEndDate').value;
    const projectDescriptionInput = document.getElementById('projectDescription').value;
    const projectIdInput = document.getElementById('projectId').value.trim();

    // Validate inputs
    if (!projectNameInput || !projectStartDateInput || !projectEndDateInput) {
        alert("Please fill in all required fields.");
        return;
    }

    const isUpdatingProject = projectIdInput !== '';
    const projectId = isUpdatingProject ? projectIdInput : generateProjectId(projectNameInput);

    const projectData = {
        projectname: projectNameInput,
        startdate: projectStartDateInput,
        enddate: projectEndDateInput,
        description: projectDescriptionInput,
        status: 'In Progress'
    };

    db.collection("projects").doc("progress").set({
        [projectId]: projectData
    }, { merge: true })
        .then(() => {
            alert(isUpdatingProject ? "Project updated successfully!" : "New project added successfully!");
            fetchAndDisplayAllProjects();
            $('#projectModal').modal('hide');
        })
        .catch(error => {
            console.error("Error saving project:", error);
            alert("Failed to save project. Please try again.");
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
function loadData(category) {
    db.collection("Portals").doc(category).get().then((doc) => {
        let content = '';
        if (doc.exists) {
            // Adjusted to retrieve the 'rows' array
            const dataArray = doc.data().rows;
            if (dataArray && Array.isArray(dataArray)) {
                dataArray.forEach(data => {
                    content += `
                        <tr>
                            <td>${data.portalLink}</td>
                            <td>${data.username}</td>
                            <td>${data.password}</td>
                            <td>${data.responsible}</td>
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
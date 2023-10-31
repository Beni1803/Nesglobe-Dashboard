function loadData(category) {
    db.collection("Portals").doc(category).get().then((doc) => {
        let content = '';
        if (doc.exists) {
            const data = doc.data();
            content += `
                <tr>
                    <td>${data.portalLink}</td>
                    <td>${data.username}</td>
                    <td>${data.password}</td>
                    <td>${data.responsible}</td>
                </tr>
            `;
        } else {
            console.log("No such document:", category);
        }
        document.getElementById(`portalData${category}`).innerHTML = content;
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}
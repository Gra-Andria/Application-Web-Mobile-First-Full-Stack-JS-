const container = document.getElementById("cards");
const refreshBtn = document.getElementById("refreshBtn");

const createCard = (id, title, content) => {
    return `
        <div class="card">
            <h2>${title}</h2>
            <p>${content}</p>
            <button onclick="deleteCard(${id})">Supprimer</button>
        </div>
    `;
};
// afficher les cartes
const renderCards = (data) => {
    container.innerHTML = data.map(item =>
        createCard(item.id, item.title, item.content)
    ).join("");
};
//offline first
const loadData = async () => {
    const localData = localStorage.getItem("cardsData");
    if (localData) {
        renderCards(JSON.parse(localData));
    } else {
        container.innerHTML = "Chargement...";
    }

    try {
        const res = await fetch("http://localhost:3000/api/data");
        const data = await res.json();
        renderCards(data);
        localStorage.setItem("cardsData", JSON.stringify(data));
    } catch (error) {
        console.log("Mode hors ligne");

        if (!localData) {
            container.innerHTML = "Aucune donnée disponnible offline";
        }
    }

};

const refreshData = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/data");
        const data = await res.json();
        renderCards(data);
        localStorage.setItem("cardsData", JSON.stringify(data));
    } catch (error) {
        alert("Impossible de rafraîchir offline");
    }
};
refreshBtn.addEventListener("click", refreshData);
loadData();

const addCard = async () => {
    await fetch("http://localhost:3000/api/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: "Nouvelle carte",
            content: "Ajoutée via REST API"
        })
    });

    loadData();
};


const deleteCard = async (id) => {
    await fetch(`http://localhost:3000/api/data/${id}`, {
        method: "DELETE"
    });

    loadData();
};

window.deleteCard = deleteCard;
const container = document.getElementById("cards");
const refreshBtn = document.getElementById("refreshBtn");

//Queue
const getQueue = () => JSON.parse(localStorage.getItem("syncQueue")) || [];
const setQueue = (queue) => localStorage.setItem("syncQueue", JSON.stringify(queue));

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

//load
const loadData = async () => {
    let localData = JSON.parse(localStorage.getItem("cardsData")) || [];

    if (localData.length > 0) {
        renderCards(localData);
    } else {
        container.innerHTML = "Chargement...";
    }

    try {
        const res = await fetch("http://localhost:3000/api/data");
        const data = await res.json();

        localStorage.setItem("cardsData", JSON.stringify(data));
        renderCards(data);
    } catch (error) {
        console.log("Mode hors ligne");

        if (!localData) {
            container.innerHTML = "Aucune donnée disponnible offline";
        }
    }

};

const addCard = () => {
    const newCard = {
        id: Date.now(),
        title: "Nouvelle carte",
        content: "Ajoutée offline"
    };

    //Ajouter en local
    const localData = JSON.parse(localStorage.getItem("cardsData")) || [];
    localData.push(newCard);
    localStorage.setItem("cardsData", JSON.stringify(localData));
    renderCards(localData);

    //Ajouter à la queue 
    const queue = getQueue();
    queue.push({ type: "ADD", data: newCard });
    setQueue(queue);

    console.log("Ajout en queue");
};


const deleteCard = (id) => {
    // Supprimer en local
    let localData = JSON.parse(localStorage.getItem("cardsData")) || [];
    localData = localData.filter(item => item.id !== id);
    localStorage.setItem("cardsData", JSON.stringify(localData));
    renderCards(localData);

    // Ajouter à la queue
    const queue = getQueue();
    queue.push({ type: "DELETE", id });
    setQueue(queue);

    console.log("Suppression en queue");
};

const syncData = async () => {
    const queue = getQueue();

    if (queue.length === 0) return;

    console.log("Synchronisation...");

    for (let action of queue) {
        try {
            if (action.type === "ADD") {
                await fetch("http://localhost:3000/api/data", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(action.data)
                });
            }

            if (action.type === "DELETE") {
                await fetch(`http://localhost:3000/api/data/${action.id}`, {
                    method: "DELETE"
                });
            }

        } catch (error) {
            console.log("Erreur sync, arrêt");
            return;
        }
    }

    //Vider la queue
    localStorage.removeItem("syncQueue");

    //Récupérer les données propres du serveur
    try {
        const res = await fetch("http://localhost:3000/api/data");
        const freshData = await res.json();

        localStorage.setItem("cardsData", JSON.stringify(freshData));
        renderCards(freshData);

    } catch (error) {
        console.log("Erreur récupération après sync");
    }

    console.log("Sync terminée ✅");
};

refreshBtn.addEventListener("click", syncData);
window.addEventListener("online", () => {
    console.log("Connexion retrouvée 🔥");
    // syncData();
});
loadData();
window.addCard = addCard;
window.deleteCard = deleteCard;
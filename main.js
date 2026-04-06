const container = document.getElementById("cards");
const refreshBtn = document.getElementById("refreshBtn");

//Queue
const getQueue = () => JSON.parse(localStorage.getItem("syncQueue")) || [];
const setQueue = (queue) => localStorage.setItem("syncQueue", JSON.stringify(queue));

const createCard = (id, title, content, type) => {
    return `
        <div class="card">
            <h2>${title}</h2>
            <p>${content}</p>
            ${type === "dynamic"
            ? `<button onclick="deleteCard(${id})">Supprimer</button>`
            : `<div style="opacity:0.6;font-size:0.8rem;">Info</div>`
        }
        </div>
    `;
};
// afficher les cartes
const renderCards = (data) => {
    container.innerHTML = data.map(item =>
        createCard(item.id, item.title, item.content, item.type)
    ).join("");
};

//load
const loadData = async () => {
    const staticCards = await getStaticCards();

    let localData = JSON.parse(localStorage.getItem("cardsData")) || [];
    mergeAndRender(staticCards);

    try {
        const res = await fetch("http://localhost:3000/api/data");
        const data = await res.json();

        localStorage.setItem("cardsData", JSON.stringify(data));
        mergeAndRender(staticCards);

    } catch (error) {
        console.log("Offline");
    }
};

const addCard = () => {
    const newCard = {
        id: Date.now(),
        title: "Nouvelle carte",
        content: "Ajoutée offline",
        type: "dynamic"
    };

    //Ajouter en local
    const localData = JSON.parse(localStorage.getItem("cardsData")) || [];
    localData.push(newCard);
    localStorage.setItem("cardsData", JSON.stringify(localData));
    // renderCards(localData);
    mergeAndRender();

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
    // renderCards(localData);
    mergeAndRender();

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
        // renderCards(freshData);
        const staticCards = await getStaticCards();
        mergeAndRender(staticCards);

    } catch (error) {
        console.log("Erreur récupération après sync");
    }

    console.log("Sync terminée ✅");
};

//API externe
const fetchExternalData = async () => {
    try {
        const res = await fetch("https://citation.lecog.fr/public/api/random-quote.php");
        const data = await res.json();

        return {
            id: "ext-" + Date.now(),
            title: "💡 Citation",
            content: `${data.data.text} — ${data.data.author.name}`,
            type: "static"
        };
    } catch (error) {
        return {
            id: "ext-offline",
            title: "💡 Citation",
            content: "Pas de connexion",
            type: "static"
        };
    }
};
const getStaticCards = async () => {
    const external = await fetchExternalData();

    let staticCards = [
        {
            id: "welcome",
            title: "👋 Bienvenue",
            content: "Dashboard intelligent",
            type: "static"
        },
        external
    ];

    // localisation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            staticCards.push({
                id: "loc",
                title: "📍 Position",
                content: `Lat: ${pos.coords.latitude}`,
                type: "static"
            });

            mergeAndRender(staticCards);
        });
    }

    return staticCards;
};

const mergeAndRender = (staticCards = []) => {
    const dynamic = JSON.parse(localStorage.getItem("cardsData")) || [];

    const formattedDynamic = dynamic.map(item => ({
        ...item,
        type: "dynamic"
    }));

    renderCards([...staticCards, ...formattedDynamic]);
};

refreshBtn.addEventListener("click", syncData);
window.addEventListener("online", () => {
    console.log("Connexion retrouvée 🔥");
    // syncData();
});
loadData();
window.addCard = addCard;
window.deleteCard = deleteCard;
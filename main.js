const container = document.getElementById("cards");
const refreshBtn = document.getElementById("refreshBtn");

const STATE = {
    staticCards: [],
    dynamicCards: []
};

const getQueue = () => JSON.parse(localStorage.getItem("syncQueue")) || [];
const setQueue = (queue) => localStorage.setItem("syncQueue", JSON.stringify(queue));

const createCard = (item) => `
    <div class="card">
        <h2>${item.title}</h2>
        <p>${item.content}</p>
        ${item.type === "dynamic"
        ? `<button onclick="deleteCard(${item.id})">Supprimer</button>`
        : `<div class="badge">Info</div>`
    }
    </div>
`;

const render = () => {
    const allCards = [...STATE.staticCards, ...STATE.dynamicCards];
    container.innerHTML = allCards.map(createCard).join("");
};


const loadLocalData = () => {
    STATE.dynamicCards = (JSON.parse(localStorage.getItem("cardsData")) || [])
        .map(item => ({ ...item, type: "dynamic" }));
};

const saveLocalData = () => {
    localStorage.setItem("cardsData", JSON.stringify(STATE.dynamicCards));
};


const fetchExternalData = async () => {
    try {
        const res = await fetch("https://citation.lecog.fr/public/api/random-quote.php");
        const data = await res.json();

        return {
            id: "ext",
            title: "💡 Citation",
            content: `${data.data.text} — ${data.data.author.name}`,
            type: "static"
        };
    } catch {
        return {
            id: "ext",
            title: "💡 Citation",
            content: "Offline",
            type: "static"
        };
    }
};

const loadStaticCards = async () => {
    const external = await fetchExternalData();

    STATE.staticCards = [
        {
            id: "welcome",
            title: "👋 Bienvenue",
            content: "Dashboard intelligent",
            type: "static"
        },
        external
    ];

    render();


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            STATE.staticCards.push({
                id: "loc",
                title: "📍 Position",
                content: `Lat: ${pos.coords.latitude}`,
                type: "static"
            });

            render();
        });
    }
};

const fetchServerData = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/data");
        const data = await res.json();

        STATE.dynamicCards = data.map(item => ({
            ...item,
            type: "dynamic"
        }));

        saveLocalData();
        render();

    } catch {
        console.log("Offline → local data used");
    }
};

const init = async () => {
    loadLocalData();
    render();

    await loadStaticCards();

    await fetchServerData();
};


const addCard = () => {
    const newCard = {
        id: Date.now(),
        title: "Nouvelle carte",
        content: "Ajoutée offline",
        type: "dynamic"
    };

    STATE.dynamicCards.push(newCard);
    saveLocalData();
    render();

    const queue = getQueue();
    queue.push({ type: "ADD", data: newCard });
    setQueue(queue);
};

const deleteCard = (id) => {
    STATE.dynamicCards = STATE.dynamicCards.filter(c => c.id !== id);
    saveLocalData();
    render();

    const queue = getQueue();
    queue.push({ type: "DELETE", id });
    setQueue(queue);
};


const syncData = async () => {
    const queue = getQueue();
    if (queue.length === 0) return;

    console.log("🔄 Sync...");

    for (let action of queue) {
        try {
            if (action.type === "ADD") {
                await fetch("http://localhost:3000/api/data", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(action.data)
                });
            }

            if (action.type === "DELETE") {
                await fetch(`http://localhost:3000/api/data/${action.id}`, {
                    method: "DELETE"
                });
            }

        } catch {
            console.log("❌ Sync failed");
            return;
        }
    }

    localStorage.removeItem("syncQueue");

    await fetchServerData();

    console.log("✅ Sync OK");
};


refreshBtn.addEventListener("click", syncData);

window.addCard = addCard;
window.deleteCard = deleteCard;

init();
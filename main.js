const container = document.getElementById("cards");
const refreshBtn = document.getElementById("refreshBtn");

const createCard = (title, content) => {
    return `
        <div class="card">
            <h2>${title}</h2>
            <p>${content}</p>
        </div>
    `;
};
// afficher les cartes
const renderCards = (data) => {
    container.innerHTML = data.map(item =>
        createCard(item.title, item.content)
    ).join("");
};
const fetchData = async () => {
    try {
        const res = await fetch("http://localhost:3000/api/data");
        const data = await res.json();
        renderCards(data);
    } catch (error) {
        container.innerHTML = "Erreur de chargement";
    }

};

refreshBtn.addEventListener("click", fetchData);
fetchData();
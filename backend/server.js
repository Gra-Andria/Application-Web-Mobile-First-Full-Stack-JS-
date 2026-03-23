const express = require('express');

const cors = require('cors');
const app = express();
app.use(cors());
app.get('/api/data', (req, res) => {
    res.json([
        { title: "Carte 1", content: "Contenu mobile-first" },
        { title: "Carte 2", content: "Données depuis Node.js" }
    ]);
});
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
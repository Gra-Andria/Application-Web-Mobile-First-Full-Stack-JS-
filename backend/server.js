const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let data = [
    { id: 1, title: "Carte 1", content: "Contenu mobile-first" },
    { id: 2, title: "Carte 2", content: "Données depuis Node.js" }
];
//GET
app.get('/api/data', (req, res) => {
    res.json(data);
});
//POST
app.post('/api/data', (req, res) => {
    const newItem = {
        id: Date.now(),
        title: req.body.title,
        content: req.body.content
    };
    data.push(newItem);
    res.json(newItem);
});
//DELETE
app.delete('/api/data/:id', (req, res) => {
    data = data.filter(item => item.id != req.params.id);
    res.json({ message: "Supprimé" });
})
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
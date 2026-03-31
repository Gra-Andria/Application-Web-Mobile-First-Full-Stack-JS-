# Dashboard Mobile-First

## Description
Cette application est un mini dashboard mobile-first développé avec Vite (frontend) et Node.js/Express (backend). 
Elle permet d'afficher des cartes dynamiques récupérées depuis une API locale.

## Frontend
- HTML/CSS/JS 
- Interface mobile-first (responsive)
- Bouton "Actualiser" pour récupérer les données à la demande

## Backend
- Node.js + Express
- API simple sur `/api/data`
- CORS activé pour communication frontend

## Workflow
1. Lancer le serveur backend : `node backend/server.js`
2. Lancer le frontend : `npm run dev`
3. Le frontend récupère les données via fetch et affiche les cartes
4. Mobile-first : le bouton prend toute la largeur sur mobile, centré et taille normale sur desktop

## Offline First
L'application utilise une approche offline-first.
Les données sont d'abord chargées depuis localStorage pour un affichage rapide,
puis mises à jour via une API Node.js.

En cas d'absence de connexion, les données sauvegardées sont utilisées,
ce qui permet à l'application de fonctionner hors ligne.

## Choix de l'API
J'ai choisi d'utiliser une API REST
Le REST est une architecture simple basée sur HTTP, qui permet la communication entre le frontend et le backend.

Ce choix est adapté à ce projet car :
- il est dacile à implenter avec fetch
- il correspond à un dashboard simple
- il est largement utilisé dans le developpement web

J'ai implémenté :
- GET : récupérer les cartes
- POST : ajouter une carte
- DELETE : supprimer une carte

## Livrables
- Code frontend
- Code backend
- Captures écran mobile + desktop
- Cette explication
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

## Livrables
- Code frontend
- Code backend
- Captures écran mobile + desktop
- Cette explication
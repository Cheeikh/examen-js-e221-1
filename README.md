# Gestion de Stock (Stock Management)

Une application web pour la gestion de stock de tissus et autres produits.

## Fonctionnalités

- Ajout de produits avec les champs: Libellé, catégorie, quantité, unité, prix, fournisseur et image
- Ajout dynamique de nouvelles catégories, unités ou fournisseurs via des popups
- Affichage des produits dans un tableau
- Gestion des conversions d'unités
- Pagination des résultats
- Génération automatique de références produits
- Upload et prévisualisation d'images

## Technologies utilisées

- HTML
- Tailwind CSS (via CDN)
- JavaScript vanilla
- json-server (pour l'API REST)

## Installation et lancement

### Méthode rapide

Utilisez le script d'installation fourni:

```bash
./install.sh
```

### Installation manuelle

1. Installez les dépendances:

```bash
npm install
```

2. Lancez le serveur JSON:

```bash
npm start
```

3. Ouvrez le fichier `index.html` dans votre navigateur ou utilisez un serveur local comme Live Server.

## Structure du projet

- `index.html`: La page principale de l'application
- `css/styles.css`: Fichier CSS pour les styles supplémentaires
- `js/app.js`: Code JavaScript pour la logique de l'application
- `db/db.json`: Base de données JSON pour json-server
- `install.sh`: Script d'installation

## Utilisation

1. Remplissez le formulaire avec les informations du produit
2. Utilisez les boutons "+" pour ajouter de nouvelles catégories, unités ou fournisseurs si nécessaire
3. Cliquez sur l'espace d'image pour télécharger une image du produit
4. Cliquez sur "VALIDER" pour ajouter le produit
5. Les produits ajoutés apparaîtront dans le tableau en dessous
6. Utilisez les boutons d'action pour modifier ou supprimer les produits 
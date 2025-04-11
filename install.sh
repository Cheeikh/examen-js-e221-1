#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Installation de l'application de gestion de stock${NC}"
echo ""

echo -e "${GREEN}Installation des dépendances...${NC}"
npm install

echo -e "${GREEN}Installation terminée avec succès!${NC}"
echo ""
echo -e "${BLUE}Pour démarrer l'application:${NC}"
echo -e "1. Exécutez ${GREEN}npm start${NC} pour lancer le serveur"
echo -e "2. Ouvrez ${GREEN}index.html${NC} dans votre navigateur"
echo ""
echo -e "${BLUE}Enjoy!${NC}" 
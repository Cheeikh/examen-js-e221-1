import * as dom from './dom.js';
import { loadExistingUnits } from '../models/units.js';
import { saveFormData } from '../utils/storage.js';
import * as api from '../api/api.js';

// Modal handlers
export function toggleModal(modal, show) {
    if (show) {
        // Save current form data before showing modal
        saveFormData();
        
        // Modal spécifique pour les unités
        if (modal === dom.uniteModal) {
            const categorieId = dom.categorieInput.value;
            const categorieName = dom.categorieSearchInput.value;
            
            console.log("Opening unite modal with categorieId:", categorieId);
            console.log("Category name:", categorieName);
            
            if (categorieId) {
                // Réinitialiser l'état du formulaire
                dom.uniteNameInput.value = '';
                dom.uniteBaseInput.value = '';
                
                // Effacer l'ID d'édition si présent
                if (dom.uniteNameInput.dataset && dom.uniteNameInput.dataset.editId) {
                    delete dom.uniteNameInput.dataset.editId;
                }
                
                // Réinitialiser le titre et le bouton
                dom.uniteModalTitle.textContent = 'Gérer les Unités';
                dom.saveUniteBtn.textContent = 'Enregistrer';
                
                // Set category name in the modal title
                dom.uniteCategorieNameSpan.textContent = categorieName || 'inconnue';
                
                // Pré-remplir le libellé avec le nom de la catégorie
                dom.uniteNameInput.value = categorieName || '';
                
                // Récupérer les infos de la catégorie et pré-remplir l'unité par défaut
                initializeUnitModalForCategory(categorieId);
                
                // Réinitialiser les conversions
                window.temporaryConversions = [];
                updateConversionsTable();
            } else {
                console.warn("No category selected when opening unite modal");
                // Inform user that a category must be selected
                alert("Veuillez d'abord sélectionner une catégorie avant d'ajouter une unité");
                
                // Don't show the modal if no category is selected
                return;
            }
        }
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    } else {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

// Initialize the unit modal for a specific category
async function initializeUnitModalForCategory(categorieId) {
    try {
        // Récupérer les informations de la catégorie en utilisant l'API commune
        const category = await api.fetchData(`categories/${categorieId}`);
        console.log("Category data:", category);
        
        // Récupérer l'unité par défaut si elle existe
        if (category && category.defaultUnitId) {
            const defaultUnit = await api.fetchData(`unites/${category.defaultUnitId}`);
            console.log("Default unit:", defaultUnit);
            
            // Pré-remplir le champ de base avec le libellé de l'unité par défaut
            dom.uniteBaseInput.value = defaultUnit.libelle || '';
        } else {
            console.warn("No default unit for this category");
            dom.uniteBaseInput.value = "Non définie";
        }
        
        // Charger les unités existantes et les afficher dans le tableau des conversions
        await loadUnitsAsConversions(categorieId);
        
    } catch (error) {
        console.error("Error initializing unit modal:", error);
        dom.uniteBaseInput.value = "Erreur de chargement";
    }
}

// Load existing units and display them in the conversions table
async function loadUnitsAsConversions(categorieId) {
    try {
        // Récupérer toutes les unités pour cette catégorie
        const unites = await api.fetchData(`unites?categorieId=${categorieId}`);
        console.log(`Found ${unites.length} units for category ID ${categorieId}`, unites);
        
        // Initialiser le tableau temporaire de conversions avec les unités existantes
        window.temporaryConversions = unites.map(unite => ({
            id: unite.id,
            libelle: unite.libelle,
            conversion: 1, // Valeur par défaut
            isUnit: true, // Marquer que c'est une unité existante
            isDefault: unite.isDefault
        }));
        
        // Mettre à jour l'affichage
        updateConversionsTableWithUnits();
        
    } catch (error) {
        console.error("Error loading units as conversions:", error);
        alert("Erreur lors du chargement des unités existantes");
    }
}

// Adaptation of updateConversionsTable to show units as well
export function updateConversionsTableWithUnits() {
    // S'assurer que la table de conversions existe
    const tableBody = dom.conversionsTableBody;
    if (!tableBody) {
        console.error("Table de conversions introuvable (conversions-table-body)");
        return;
    }
    
    // Vider le tableau existant
    tableBody.innerHTML = '';
    
    // Initialiser si nécessaire
    if (!window.temporaryConversions || !Array.isArray(window.temporaryConversions)) {
        console.log("Initialisation d'un tableau de conversions vide");
        window.temporaryConversions = [];
    }
    
    console.log("Mise à jour du tableau avec unités et conversions:", window.temporaryConversions);
    
    // Ajouter chaque élément au tableau
    if (window.temporaryConversions.length > 0) {
        window.temporaryConversions.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.className = 'border-b';
            
            // Vérifier si c'est une unité existante ou une conversion
            const isUnit = item.isUnit === true;
            const isDefaultUnit = item.isDefault === true;
            
            // Formater la valeur
            const conversionValue = parseFloat(item.conversion);
            const formattedValue = isNaN(conversionValue) 
                ? '0' 
                : conversionValue.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
            
            // Ajouter un badge pour l'unité par défaut
            const defaultBadge = isDefaultUnit ? 
                '<span class="text-xs ml-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Défaut</span>' : '';
            
            tr.innerHTML = `
                <td class="px-4 py-2">${item.libelle || ''} ${defaultBadge}</td>
                <td class="px-4 py-2">${isUnit ? '-' : formattedValue}</td>
                <td class="px-4 py-2">
                    ${isDefaultUnit ? '' : `
                    <button class="${isUnit ? 'delete-unit' : 'delete-conversion'} text-red-600" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    `}
                </td>
            `;
            
            // Ajouter les écouteurs d'événements pour les boutons de suppression
            const deleteBtn = tr.querySelector('.delete-unit, .delete-conversion');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', async () => {
                    console.log(`Suppression de l'élément à l'index ${index}:`, item);
                    
                    if (isUnit) {
                        // Vérifier si l'unité peut être supprimée (appel à la fonction deleteExistingUnit)
                        try {
                            // Importer dynamiquement la fonction depuis units.js
                            const unitsModule = await import('../models/units.js');
                            if (unitsModule && typeof unitsModule.deleteExistingUnit === 'function') {
                                await unitsModule.deleteExistingUnit({
                                    id: item.id,
                                    libelle: item.libelle,
                                    isDefault: item.isDefault,
                                    categorieId: dom.categorieInput.value
                                });
                                
                                // Recharger les unités après suppression
                                await loadUnitsAsConversions(dom.categorieInput.value);
                            } else {
                                console.error("Fonction deleteExistingUnit non disponible");
                                alert("Erreur lors de la suppression de l'unité");
                            }
                        } catch (error) {
                            console.error("Erreur lors de la suppression de l'unité:", error);
                            alert("Erreur lors de la suppression de l'unité");
                        }
                    } else {
                        // Supprimer simplement la conversion de la liste temporaire
                        window.temporaryConversions.splice(index, 1);
                        updateConversionsTableWithUnits();
                    }
                });
            }
            
            tableBody.appendChild(tr);
        });
    } else {
        // Afficher un message quand aucun élément n'est disponible
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="3" class="px-4 py-2 text-center text-gray-500 italic">Aucune unité ou conversion disponible</td>`;
        tableBody.appendChild(tr);
    }
}

// Fetch and display the default unit for a category
async function fetchCategoryDefaultUnit(categorieId) {
    try {
        // Récupérer les informations de la catégorie en utilisant l'API commune
        const category = await api.fetchData(`categories/${categorieId}`);
        console.log("Category data:", category);
        
        // Récupérer l'unité par défaut
        if (category && category.defaultUnitId) {
            const defaultUnit = await api.fetchData(`unites/${category.defaultUnitId}`);
            console.log("Default unit:", defaultUnit);
            
            // Mettre à jour l'affichage de l'unité par défaut
            if (dom.defaultUnitName && dom.defaultUnitBase) {
                dom.defaultUnitName.textContent = defaultUnit.libelle || '-';
                dom.defaultUnitBase.textContent = defaultUnit.base || '-';
            } else {
                console.error("Default unit DOM elements not found:", { 
                    defaultUnitName: dom.defaultUnitName,
                    defaultUnitBase: dom.defaultUnitBase
                });
            }
        } else {
            console.warn("No default unit for this category");
            if (dom.defaultUnitName && dom.defaultUnitBase) {
                dom.defaultUnitName.textContent = "Non définie";
                dom.defaultUnitBase.textContent = "-";
            }
        }
    } catch (error) {
        console.error("Error fetching category default unit:", error);
        if (dom.defaultUnitName && dom.defaultUnitBase) {
            dom.defaultUnitName.textContent = "Erreur de chargement";
            dom.defaultUnitBase.textContent = "-";
        }
    }
}

// Conversions table functions
export function updateConversionsTable() {
    // S'assurer que la table de conversions existe
    const tableBody = dom.conversionsTableBody;
    if (!tableBody) {
        console.error("Table de conversions introuvable (conversions-table-body)");
        return;
    }
    
    // Vider le tableau existant
    tableBody.innerHTML = '';
    
    // Initialiser si nécessaire
    if (!window.temporaryConversions || !Array.isArray(window.temporaryConversions)) {
        console.log("Initialisation d'un tableau de conversions vide");
        window.temporaryConversions = [];
    }
    
    console.log("Mise à jour du tableau de conversions:", window.temporaryConversions);
    
    // Ajouter chaque conversion au tableau
    if (window.temporaryConversions.length > 0) {
        window.temporaryConversions.forEach((conversion, index) => {
            const tr = document.createElement('tr');
            tr.className = 'border-b';
            
            // Formater la valeur de conversion avec la locale française (virgule comme séparateur décimal)
            const conversionValue = parseFloat(conversion.conversion);
            const formattedValue = isNaN(conversionValue) 
                ? '0' 
                : conversionValue.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
            
            tr.innerHTML = `
                <td class="px-4 py-2">${conversion.libelle || ''}</td>
                <td class="px-4 py-2">${formattedValue}</td>
                <td class="px-4 py-2">
                    <button class="delete-conversion text-red-600" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </td>
            `;
            
            const deleteBtn = tr.querySelector('.delete-conversion');
            deleteBtn.addEventListener('click', () => {
                console.log("Suppression de la conversion à l'index", index);
                window.temporaryConversions.splice(index, 1);
                updateConversionsTable();
            });
            
            tableBody.appendChild(tr);
        });
    } else {
        // Afficher un message quand aucune conversion n'est disponible
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="3" class="px-4 py-2 text-center text-gray-500 italic">Aucune conversion ajoutée</td>`;
        tableBody.appendChild(tr);
    }
}

export function addTemporaryConversion() {
    // Vérifier que les éléments existent
    if (!dom.libelleUniteInput || !dom.valeurConversionInput) {
        console.error("Éléments de conversion manquants dans le DOM:", 
                     { libelleInput: dom.libelleUniteInput, valeurInput: dom.valeurConversionInput });
        alert("Erreur: Les champs de conversion sont introuvables.");
        return;
    }

    const libelle = dom.libelleUniteInput.value.trim();
    const valeurStr = dom.valeurConversionInput.value.trim().replace(',', '.');
    
    if (libelle === '' || valeurStr === '') {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    // Valider que la valeur est un nombre
    const valeur = parseFloat(valeurStr);
    if (isNaN(valeur)) {
        alert('La valeur de conversion doit être un nombre');
        return;
    }
    
    // Vérifier si une conversion avec ce libellé existe déjà
    if (!window.temporaryConversions) {
        console.log("Initialisation du tableau de conversions");
        window.temporaryConversions = [];
    } else if (window.temporaryConversions.some(c => c.libelle.toLowerCase() === libelle.toLowerCase())) {
        alert('Une conversion avec ce libellé existe déjà');
        return;
    }
    
    console.log(`Ajout d'une conversion: ${libelle} = ${valeur}`);
    
    // Ajouter la nouvelle conversion
    window.temporaryConversions.push({
        libelle,
        conversion: valeur,
        isUnit: false // Marquer comme une conversion, pas une unité existante
    });
    
    // Réinitialiser les champs
    dom.libelleUniteInput.value = '';
    dom.valeurConversionInput.value = '';
    
    // Mettre à jour le tableau avec la nouvelle fonction
    updateConversionsTableWithUnits();
}

// Setup for unit modal
export function setupUnitModal() {
    // Log pour le débogage
    console.log("Configuration du modal des unités avec les éléments suivants :");
    console.log("- conversionsTableBody:", dom.conversionsTableBody);
    console.log("- libelleUniteInput:", dom.libelleUniteInput);
    console.log("- valeurConversionInput:", dom.valeurConversionInput);
    console.log("- addConversionBtn:", dom.addConversionBtn);
    
    // Vérifier que le bouton d'ajout de conversion est correctement configuré
    if (dom.addConversionBtn) {
        // Supprimer les anciens écouteurs pour éviter les doublons
        dom.addConversionBtn.removeEventListener('click', addTemporaryConversion);
        
        // Ajouter le nouvel écouteur
        dom.addConversionBtn.addEventListener('click', addTemporaryConversion);
        console.log("Écouteur d'événement ajouté au bouton d'ajout de conversion");
    } else {
        console.error("Bouton d'ajout de conversion non trouvé dans le DOM");
    }
}
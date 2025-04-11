import { loadCategories } from './models/categories.js';
import { setupUnitsListeners, loadUnitsForCategory } from './models/units.js';
import { loadFournisseurs } from './models/suppliers.js';
import { loadProduits, setupPagination, handleProductSubmit } from './models/products.js';
import { handleCategorieSubmit } from './models/categories.js';
import { handleUniteSubmit } from './models/units.js';
import { handleFournisseurSubmit } from './models/suppliers.js';
import { toggleModal, addTemporaryConversion, setupUnitModal } from './ui/modals.js';
import { handleImageUpload, generateReference } from './utils/helpers.js';
import { restoreFormData, saveFormData } from './utils/storage.js';
import * as dom from './ui/dom.js';

// Temporary storage for conversions (will be moved to a global scope)
window.temporaryConversions = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log("Application initializing...");
    initializeApp();
    setupEventListeners();
    restoreFormData(loadUnitsForCategory);
});

// Initialize the application
function initializeApp() {
    // Disable unite add button by default
    dom.addUniteBtn.disabled = true;
    dom.addUniteBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    loadCategories();
    loadProduits(1);
    setupPagination();
    loadFournisseurs();
    
    // Configurer les événements pour les unités
    setupUnitsListeners();
    
    // Générer un numéro de référence pour le nouveau produit
    generateReference();
}

// Setup all event listeners
function setupEventListeners() {
    // Add event listeners for form
    dom.validerBtn.addEventListener('click', handleProductSubmit);
    
    // Setup modal close/open handlers
    
    // Unité modal
    dom.addUniteBtn.addEventListener('click', () => toggleModal(dom.uniteModal, true));
    dom.cancelUniteBtn.addEventListener('click', () => toggleModal(dom.uniteModal, false));
    dom.saveUniteBtn.addEventListener('click', handleUniteSubmit);
    
    // Configure les éléments du modal unité
    setupUnitModal();
    
    // Catégorie modal
    dom.addCategorieBtn.addEventListener('click', () => toggleModal(dom.categorieModal, true));
    dom.cancelCategorieBtn.addEventListener('click', () => toggleModal(dom.categorieModal, false));
    dom.saveCategorieBtn.addEventListener('click', handleCategorieSubmit);
    
    // Fournisseur modal
    dom.addFournisseurBtn.addEventListener('click', () => toggleModal(dom.fournisseurModal, true));
    dom.cancelFournisseurBtn.addEventListener('click', () => toggleModal(dom.fournisseurModal, false));
    dom.saveFournisseurBtn.addEventListener('click', handleFournisseurSubmit);
    
    // Handle image upload
    dom.productImageInput.addEventListener('change', handleImageUpload);
    
    // Generate reference when libelle or categorie changes
    dom.libelleInput.addEventListener('input', generateReference);
    dom.categorieSearchInput.addEventListener('change', generateReference);
    
    // Save form data on input change
    document.querySelectorAll('#product-form input, #product-form select').forEach(input => {
        input.addEventListener('change', saveFormData);
        input.addEventListener('input', saveFormData);
    });
}
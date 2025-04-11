import * as dom from '../ui/dom.js';
import * as api from '../api/api.js';
import { toggleModal } from '../ui/modals.js';
import { loadUnitsForCategory } from './units.js';
import { saveFormData } from '../utils/storage.js';
import { generateReference } from '../utils/helpers.js';

// Load all categories
export async function loadCategories() {
    const categories = await api.fetchData('categories');
    
    // Add dropdown functionality
    const showCategorieDropdown = () => {
        // Clear previous suggestions
        const existingList = document.getElementById('categorie-suggestions');
        if (existingList) {
            existingList.remove();
        }
        
        const suggestionList = document.createElement('ul');
        suggestionList.id = 'categorie-suggestions';
        suggestionList.className = 'absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-lg max-h-60 overflow-y-auto shadow-lg';
        
        // Add all categories to dropdown
        categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
            li.textContent = category.libelle;
            li.dataset.id = category.id;
            li.dataset.uniteDefault = category.uniteDefault || '';
            li.addEventListener('click', async () => {
                dom.categorieSearchInput.value = category.libelle;
                dom.categorieInput.value = category.id;
                
                // Enable unite add button
                dom.addUniteBtn.disabled = false;
                dom.addUniteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                
                // Store the category data for use in the unite modal
                dom.categorieSearchInput.dataset.uniteDefault = category.uniteDefault || '';
                dom.categorieSearchInput.dataset.id = category.id;
                
                // Load units for this category and select default unit
                await loadUnitsForCategory(category.id);
                
                // Find default unit for this category and select it
                const unites = await api.fetchData(`unites?categorieId=${category.id}`);
                const defaultUnit = unites.find(unit => unit.libelle === category.uniteDefault);
                if (defaultUnit) {
                    dom.uniteSearchInput.value = defaultUnit.libelle;
                    dom.uniteInput.value = defaultUnit.id;
                } else if (unites.length > 0) {
                    // If no default unit found but units exist, select the first one
                    dom.uniteSearchInput.value = unites[0].libelle;
                    dom.uniteInput.value = unites[0].id;
                } else {
                    // If no units exist for this category, clear unit selection
                    dom.uniteSearchInput.value = '';
                    dom.uniteInput.value = '';
                }
                
                suggestionList.remove();
                saveFormData();
                generateReference();
            });
            suggestionList.appendChild(li);
        });
        
        if (categories.length === 0) {
            const li = document.createElement('li');
            li.className = 'px-4 py-2 text-gray-500 italic';
            li.textContent = 'Aucune catégorie disponible';
            suggestionList.appendChild(li);
        }
        
        dom.categorieSearchInput.parentNode.appendChild(suggestionList);
    };
    
    // Show dropdown when clicking on the input
    dom.categorieSearchInput.addEventListener('click', () => {
        showCategorieDropdown();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const existingList = document.getElementById('categorie-suggestions');
        if (existingList && !dom.categorieSearchInput.contains(event.target) && !existingList.contains(event.target)) {
            existingList.remove();
        }
    });
}

// Handle category submit
export async function handleCategorieSubmit() {
    const libelle = dom.categorieNameInput.value.trim();
    const uniteDefault = dom.uniteDefaultInput.value.trim();
    const valeurDefault = dom.valeurDefaultInput.value.trim();
    
    if (libelle === '' || uniteDefault === '' || valeurDefault === '') {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    const categorieData = {
        libelle,
        uniteDefault,
        valeurDefault: parseFloat(valeurDefault)
    };
    
    // First, add the category
    const categoryResult = await api.postData('categories', categorieData);
    if (categoryResult) {
        // Next, create a default unit for this category
        const uniteData = {
            libelle: uniteDefault,
            base: uniteDefault,
            categorieId: categoryResult.id,
            isDefault: true,
            conversions: []
        };
        
        const unitResult = await api.postData('unites', uniteData);
        
        if (unitResult) {
            // Update the category with the default unit ID
            const updatedCategoryData = {
                ...categoryResult,
                defaultUnitId: unitResult.id
            };
            
            await api.putData(`categories/${categoryResult.id}`, updatedCategoryData);
        }
        
        toggleModal(dom.categorieModal, false);
        
        // Set the newly created category as selected
        dom.categorieInput.value = categoryResult.id;
        dom.categorieSearchInput.value = categoryResult.libelle;
        dom.categorieSearchInput.dataset.uniteDefault = categoryResult.uniteDefault;
        dom.categorieSearchInput.dataset.id = categoryResult.id;
        
        // Enable unite add button
        dom.addUniteBtn.disabled = false;
        dom.addUniteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        
        // Set the new unit as selected
        if (unitResult) {
            dom.uniteInput.value = unitResult.id;
            dom.uniteSearchInput.value = unitResult.libelle;
        }
        
        await loadUnitsForCategory(categoryResult.id);
        saveFormData();
        generateReference();
        
        dom.categorieNameInput.value = '';
        dom.uniteDefaultInput.value = '';
        dom.valeurDefaultInput.value = '';
    } else {
        alert('Erreur lors de l\'ajout de la catégorie');
    }
}
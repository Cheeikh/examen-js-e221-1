import * as dom from '../ui/dom.js';
import * as api from '../api/api.js';
import { saveFormData } from '../utils/storage.js';
import { updateConversionsTable } from '../ui/modals.js';

// Load units for a specific category
export async function loadUnitsForCategory(categoryId) {
    // Get all units for the category
    const unites = await api.fetchData(`unites?categorieId=${categoryId}`);
    
    // Add dropdown functionality
    const showUniteDropdown = () => {
        // Clear previous suggestions
        const existingList = document.getElementById('unite-suggestions');
        if (existingList) {
            existingList.remove();
        }
        
        const suggestionList = document.createElement('ul');
        suggestionList.id = 'unite-suggestions';
        suggestionList.className = 'absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-lg max-h-60 overflow-y-auto shadow-lg';
        
        // Add filtered units to dropdown
        unites.forEach(unite => {
            const li = document.createElement('li');
            li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
            li.textContent = unite.libelle;
            li.dataset.id = unite.id;
            li.addEventListener('click', () => {
                dom.uniteSearchInput.value = unite.libelle;
                dom.uniteInput.value = unite.id;
                suggestionList.remove();
                saveFormData();
            });
            suggestionList.appendChild(li);
        });
        
        if (unites.length === 0) {
            const li = document.createElement('li');
            li.className = 'px-4 py-2 text-gray-500 italic';
            li.textContent = 'Aucune unité disponible pour cette catégorie';
            suggestionList.appendChild(li);
        }
        
        dom.uniteSearchInput.parentNode.appendChild(suggestionList);
    };
    
    // Update click event for showing units dropdown
    dom.uniteSearchInput.removeEventListener('click', dom.uniteSearchInput.clickHandler);
    dom.uniteSearchInput.clickHandler = showUniteDropdown;
    dom.uniteSearchInput.addEventListener('click', dom.uniteSearchInput.clickHandler);
    
    return unites;
}

export function setupUnitsListeners() {
    // This function will now only setup the initial click handler
    // The actual units will be loaded based on the selected category
    
    // Store the click handler on the element for later removal
    dom.uniteSearchInput.clickHandler = () => {
        // If no category is selected, show a message
        if (!dom.categorieInput.value) {
            alert('Veuillez d\'abord sélectionner une catégorie');
            return;
        }
        
        // If category is selected, load units for that category
        loadUnitsForCategory(dom.categorieInput.value);
    };
    
    // Show dropdown when clicking on the input
    dom.uniteSearchInput.addEventListener('click', dom.uniteSearchInput.clickHandler);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const existingList = document.getElementById('unite-suggestions');
        if (existingList && !dom.uniteSearchInput.contains(event.target) && !existingList.contains(event.target)) {
            existingList.remove();
        }
    });
}

// Load existing units for the selected category
export async function loadExistingUnits(categorieId) {
    try {
        console.log(`Fetching units for category ID: ${categorieId}`);
        
        // Ensure categorieId is a valid integer before making the request
        const validCategorieId = parseInt(categorieId);
        if (isNaN(validCategorieId)) {
            console.error("Invalid categorieId:", categorieId);
            return;
        }
        
        // Get the category to know what the default unit is
        const categories = await api.fetchData(`categories?id=${validCategorieId}`);
        const category = categories && categories.length > 0 ? categories[0] : null;
        
        // Récupérer toutes les unités pour cette catégorie en utilisant l'API commune
        const unites = await api.fetchData(`unites?categorieId=${validCategorieId}`);
        console.log(`Found ${unites.length} units for category ID ${validCategorieId}`, unites);
        
        // Check if there's a default unit in the response - either by isDefault flag or by matching uniteDefault
        let defaultUnit = unites.find(u => u.isDefault === true);
        
        // If no unit with isDefault flag, try to find by matching the category's uniteDefault
        if (!defaultUnit && category && category.uniteDefault) {
            defaultUnit = unites.find(u => u.libelle === category.uniteDefault);
        }
        
        if (defaultUnit) {
            console.log("Default unit found:", defaultUnit);
            dom.defaultUnitName.textContent = defaultUnit.libelle || '-';
            dom.defaultUnitBase.textContent = defaultUnit.base || '-';
        } else {
            // Pas d'unité par défaut
            console.warn("No default unit found for category", validCategorieId);
            dom.defaultUnitName.textContent = "Non définie";
            dom.defaultUnitBase.textContent = "-";
        }
        
        // Get the table body for existing units
        const existingUnitsTableBody = document.getElementById('existing-units-table-body');
        
        if (!existingUnitsTableBody) {
            console.error("Existing units table body not found in the DOM. Element ID: 'existing-units-table-body'");
            alert("Erreur d'affichage des unités: élément HTML manquant");
            return;
        }
        
        // Clear the table
        existingUnitsTableBody.innerHTML = '';
        
        if (unites.length > 0) {
            // Add units to the table
            unites.forEach(unite => {
                // Update isDefault visualization logic
                const isDefaultUnit = unite.isDefault === true || 
                    (category && category.uniteDefault === unite.libelle);
                
                const isDefault = isDefaultUnit ? 
                    '<span class="text-xs ml-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Défaut</span>' : '';
                
                const tr = document.createElement('tr');
                tr.className = 'border-b hover:bg-gray-50';
                tr.innerHTML = `
                    <td class="px-4 py-2">${unite.libelle} ${isDefault}</td>
                    <td class="px-4 py-2">${unite.base}</td>
                    <td class="px-4 py-2 flex space-x-2">
                        <button class="edit-unit-btn text-blue-600 hover:text-blue-800" data-id="${unite.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        ${isDefaultUnit ? '' : `
                        <button class="delete-unit-btn text-red-600 hover:text-red-800" data-id="${unite.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        `}
                    </td>
                `;
                
                existingUnitsTableBody.appendChild(tr);
            });
            
            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-unit-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const uniteId = parseInt(btn.dataset.id);
                    console.log("Edit button clicked for unit ID:", uniteId);
                    
                    if (!uniteId || isNaN(uniteId)) {
                        console.error("Invalid unit ID:", btn.dataset.id);
                        return;
                    }
                    
                    const unite = unites.find(u => u.id === uniteId);
                    if (unite) {
                        console.log("Found unit to edit:", unite);
                        await editExistingUnit(unite);
                    } else {
                        console.error("Could not find unit with ID:", uniteId);
                    }
                });
            });
            
            document.querySelectorAll('.delete-unit-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const uniteId = parseInt(btn.dataset.id);
                    console.log("Delete button clicked for unit ID:", uniteId);
                    
                    if (!uniteId || isNaN(uniteId)) {
                        console.error("Invalid unit ID:", btn.dataset.id);
                        return;
                    }
                    
                    const unite = unites.find(u => u.id === uniteId);
                    if (unite) {
                        await deleteExistingUnit(unite);
                    } else {
                        console.error("Could not find unit with ID:", uniteId);
                    }
                });
            });
        } else {
            // No units found
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="3" class="px-4 py-2 text-center text-gray-500 italic">
                    Aucune unité disponible pour cette catégorie
                </td>
            `;
            existingUnitsTableBody.appendChild(tr);
        }
    } catch (error) {
        console.error('Error loading existing units:', error);
        // Afficher un message d'erreur dans le tableau
        const existingUnitsTableBody = document.getElementById('existing-units-table-body');
        if (existingUnitsTableBody) {
            existingUnitsTableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="px-4 py-2 text-center text-red-500">
                        Erreur lors du chargement des unités: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

// Edit an existing unit
export async function editExistingUnit(unite) {
    console.log("Editing unit:", unite);
    
    if (!unite || !unite.id) {
        console.error("Invalid unit provided for editing");
        return;
    }
    
    // Récupérer les détails complets de l'unité avec ses conversions
    try {
        const completeUnit = await api.fetchData(`unites/${unite.id}`);
        console.log("Complete unit data with conversions:", completeUnit);
        
        // Store the ID in a data attribute for later use
        dom.uniteNameInput.dataset.editId = completeUnit.id;
        
        // Update form fields
        dom.uniteNameInput.value = completeUnit.libelle || '';
        dom.uniteBaseInput.value = completeUnit.base || '';
        
        // Manage optional fields
        if (dom.uniteMultiplicateurInput) dom.uniteMultiplicateurInput.value = completeUnit.multiplicateur || '';
        if (dom.uniteSymboleInput) dom.uniteSymboleInput.value = completeUnit.symbole || '';
        
        // Update UI to show we're editing
        dom.uniteModalTitle.textContent = `Modifier l'unité "${completeUnit.libelle}"`;
        dom.saveUniteBtn.textContent = 'Mettre à jour';
        
        // Load and display conversions
        console.log("Loading conversions for unit ID:", completeUnit.id);
        
        // Initialiser le tableau des conversions
        window.temporaryConversions = [];
        
        // Si l'unité a des conversions définies, les charger
        if (completeUnit.conversions && Array.isArray(completeUnit.conversions) && completeUnit.conversions.length > 0) {
            window.temporaryConversions = [...completeUnit.conversions];
            console.log("Loaded conversions:", window.temporaryConversions);
        } else {
            console.log("No conversions found for this unit");
        }
        
        // Mettre à jour l'affichage du tableau des conversions
        updateConversionsTable();
        
        // Scroll to the form
        const formElement = document.querySelector('#unite-form-fields');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.error("Could not find #unite-form-fields element");
        }
    } catch (error) {
        console.error("Error loading unit details:", error);
        alert("Erreur lors du chargement des détails de l'unité");
    }
}

// Load conversions for a unit
export async function loadConversions(uniteId) {
    try {
        console.log("Loading conversions for unit ID:", uniteId);
        const unite = await api.fetchData(`unites/${uniteId}`);
        
        if (unite && unite.conversions && Array.isArray(unite.conversions)) {
            console.log("Found conversions:", unite.conversions);
            window.temporaryConversions = [...unite.conversions];
            updateConversionsTable();
        } else {
            console.log("No conversions found or invalid data structure", unite);
            window.temporaryConversions = [];
            updateConversionsTable();
        }
    } catch (error) {
        console.error('Error loading conversions:', error);
        window.temporaryConversions = [];
        updateConversionsTable();
    }
}

// Delete an existing unit
export async function deleteExistingUnit(unite) {
    if (!unite) {
        console.error("No unit provided to delete");
        return;
    }
    
    // Get the category to check if this is the default unit
    const categories = await api.fetchData(`categories?id=${unite.categorieId}`);
    const category = categories && categories.length > 0 ? categories[0] : null;
    
    // Check if it's the default unit - either by isDefault flag or by matching uniteDefault
    const isDefaultUnit = 
        unite.isDefault === true || 
        (category && category.uniteDefault === unite.libelle);
    
    if (isDefaultUnit) {
        alert('Impossible de supprimer l\'unité par défaut de la catégorie');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette unité?')) {
        // Check if there are any products using this unit
        const productsWithUnit = await api.fetchData(`produits?uniteId=${unite.id}`);
        
        if (productsWithUnit.length > 0) {
            alert('Impossible de supprimer cette unité car elle est utilisée par des produits');
            return;
        }
        
        const success = await api.deleteData('unites', unite.id);
        if (success) {
            // Reload units
            await loadExistingUnits(unite.categorieId);
            
            // If the deleted unit was selected, clear the selection
            if (dom.uniteInput.value == unite.id) {
                dom.uniteInput.value = '';
                dom.uniteSearchInput.value = '';
            }
            
            // Reload units for the category in the main form
            await loadUnitsForCategory(unite.categorieId);
        } else {
            alert('Erreur lors de la suppression de l\'unité');
        }
    }
}

// Handle unit submit
export async function handleUniteSubmit() {
    // Parse the category ID from the input and ensure it's valid
    const categorieId = parseInt(dom.categorieInput.value);
    console.log("Submitting unit for category ID:", categorieId);
    
    if (!categorieId || isNaN(categorieId)) {
        alert('Erreur: aucune catégorie sélectionnée');
        return;
    }
    
    // Ne pas utiliser les valeurs du formulaire car elles sont en readonly
    // Les récupérer depuis les conversions (unités existantes et nouvelles conversions)
    if (!window.temporaryConversions || !Array.isArray(window.temporaryConversions)) {
        alert('Aucune conversion ajoutée');
        return;
    }
    
    // Filtrer pour récupérer uniquement les véritables conversions (pas les unités existantes)
    const conversions = window.temporaryConversions.filter(item => !item.isUnit);
    
    if (conversions.length === 0) {
        alert('Veuillez ajouter au moins une conversion');
        return;
    }
    
    // Validate conversions (should have valid libelle and numeric conversion value)
    const invalidConversions = conversions.filter(
        c => !c.libelle || !c.conversion || isNaN(parseFloat(c.conversion))
    );
    
    if (invalidConversions.length > 0) {
        alert('Certaines conversions sont invalides. Vérifiez les valeurs.');
        console.error("Invalid conversions:", invalidConversions);
        return;
    }
    
    // Ensure all conversion values are numbers
    const validConversions = conversions.map(c => ({
        libelle: c.libelle,
        conversion: parseFloat(c.conversion)
    }));
    
    // Creating new unit (we don't edit units in this new version, we only add conversions)
    const uniteData = {
        libelle: dom.uniteNameInput.value,
        base: dom.uniteBaseInput.value,
        categorieId,
        conversions: validConversions,
        isDefault: false // New units are never default
    };
    
    console.log("Creating new unit:", uniteData);
    
    const result = await api.postData('unites', uniteData);
    if (!result) {
        alert('Erreur lors de l\'ajout de l\'unité');
        return;
    }
    
    // Set the newly created unite as selected
    dom.uniteInput.value = result.id;
    dom.uniteSearchInput.value = result.libelle;
    
    // Reset form and close modal
    window.temporaryConversions = [];
    
    // Très important: nettoyer l'attribut data-edit-id
    delete dom.uniteNameInput.dataset.editId;
    
    // Reload units in both the modal and the main form
    await loadUnitsForCategory(categorieId);
    
    // Get a reference to the updated toggleModal function from modals.js
    const modalsModule = await import('../ui/modals.js');
    if (modalsModule && typeof modalsModule.toggleModal === 'function') {
        modalsModule.toggleModal(dom.uniteModal, false);
    } else {
        // Fallback if function is unavailable
        dom.uniteModal.classList.remove('active');
        setTimeout(() => {
            dom.uniteModal.classList.add('hidden');
        }, 300);
    }
    
    saveFormData(); // Save form with new selection
    
    console.log("Unit operation completed successfully");
}
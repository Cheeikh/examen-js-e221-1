// Constants
const API_URL = 'http://localhost:3000';
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
const FORM_STORAGE_KEY = 'produit_form_data';

// DOM Elements
const productForm = document.querySelector('.bg-white.p-6');
const libelleInput = document.getElementById('libelle');
const categorieInput = document.getElementById('categorie');
const categorieSearchInput = document.getElementById('categorie-search');
const addCategorieBtn = document.getElementById('add-categorie');
const quantiteInput = document.getElementById('quantite');
const uniteInput = document.getElementById('unite');
const uniteSearchInput = document.getElementById('unite-search');
const addUniteBtn = document.getElementById('add-unite');
const prixInput = document.getElementById('prix');
const fournisseurInput = document.getElementById('fournisseur-search');
const addFournisseurBtn = document.getElementById('add-fournisseur');
const validerBtn = document.getElementById('valider');
const produitsTableBody = document.getElementById('produits-table-body');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const referenceDisplay = document.getElementById('reference-display');
const productImageInput = document.getElementById('product-image');
const imagePreview = document.getElementById('image-preview');
const imagePlaceholder = document.getElementById('image-placeholder');
const uniteCategorieNameSpan = document.getElementById('unite-categorie-name');

// Modal Elements
const uniteModal = document.getElementById('unite-modal');
const uniteNameInput = document.getElementById('unite-name');
const uniteBaseInput = document.getElementById('unite-base');
const newUniteLibelleInput = document.getElementById('new-unite-libelle');
const newUniteBaseInput = document.getElementById('new-unite-base');
const existingUnitsTableBody = document.getElementById('existing-units-table-body');
const libelleUniteInput = document.getElementById('libelle-unite');
const valeurConversionInput = document.getElementById('valeur-conversion');
const addConversionBtn = document.getElementById('add-conversion');
const conversionsTableBody = document.getElementById('conversions-table-body');
const saveUniteBtn = document.getElementById('save-unite');
const cancelUniteBtn = document.getElementById('cancel-unite');

const categorieModal = document.getElementById('categorie-modal');
const categorieNameInput = document.getElementById('categorie-name');
const uniteDefaultInput = document.getElementById('unite-default');
const valeurDefaultInput = document.getElementById('valeur-default');
const saveCategorieBtn = document.getElementById('save-categorie');
const cancelCategorieBtn = document.getElementById('cancel-categorie');

const fournisseurModal = document.getElementById('fournisseur-modal');
const fournisseurPrenomInput = document.getElementById('fournisseur-prenom');
const fournisseurNomInput = document.getElementById('fournisseur-nom');
const fournisseurTelephoneInput = document.getElementById('fournisseur-telephone');
const fournisseurAdresseInput = document.getElementById('fournisseur-adresse');
const saveFournisseurBtn = document.getElementById('save-fournisseur');
const cancelFournisseurBtn = document.getElementById('cancel-fournisseur');

// Temporary storage for conversions
let temporaryConversions = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    restoreFormData();
});

// Initialize the application
function initializeApp() {
    // Disable unite add button by default
    addUniteBtn.disabled = true;
    addUniteBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    loadCategories();
    loadUnites();
    loadFournisseurs();
    loadProduits();
    updatePaginationButtons();
}

// Setup all event listeners
function setupEventListeners() {
    // Product form
    validerBtn.addEventListener('click', handleProductSubmit);
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProduits();
            updatePaginationButtons();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        loadProduits();
        updatePaginationButtons();
    });
    
    // Modal triggers
    addCategorieBtn.addEventListener('click', () => toggleModal(categorieModal, true));
    addUniteBtn.addEventListener('click', () => toggleModal(uniteModal, true));
    addFournisseurBtn.addEventListener('click', () => toggleModal(fournisseurModal, true));
    
    // Modal cancels
    cancelCategorieBtn.addEventListener('click', () => toggleModal(categorieModal, false));
    cancelUniteBtn.addEventListener('click', () => toggleModal(uniteModal, false));
    cancelFournisseurBtn.addEventListener('click', () => toggleModal(fournisseurModal, false));
    
    // Modal saves
    saveCategorieBtn.addEventListener('click', handleCategorieSubmit);
    saveUniteBtn.addEventListener('click', handleUniteSubmit);
    saveFournisseurBtn.addEventListener('click', handleFournisseurSubmit);
    
    // Conversions
    addConversionBtn.addEventListener('click', addTemporaryConversion);
    
    // Generate reference when libelle or categorie changes
    libelleInput.addEventListener('input', generateReference);
    categorieSearchInput.addEventListener('change', generateReference);
    
    // Image upload handling
    productImageInput.addEventListener('change', handleImageUpload);
    
    // Save form data on input changes
    const formInputs = [libelleInput, categorieInput, quantiteInput, uniteInput, prixInput, fournisseurInput];
    formInputs.forEach(input => {
        input.addEventListener('change', saveFormData);
        input.addEventListener('input', saveFormData);
    });
}

// API functions
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return [];
    }
}

async function postData(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error);
        return null;
    }
}

async function deleteData(endpoint, id) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error(`Error deleting from ${endpoint}:`, error);
        return false;
    }
}

// Data loading functions
async function loadCategories() {
    const categories = await fetchData('categories');
    
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
                categorieSearchInput.value = category.libelle;
                categorieInput.value = category.id;
                
                // Enable unite add button
                addUniteBtn.disabled = false;
                addUniteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                
                // Store the category data for use in the unite modal
                categorieSearchInput.dataset.uniteDefault = category.uniteDefault || '';
                categorieSearchInput.dataset.id = category.id;
                
                // Load units for this category and select default unit
                await loadUnitsForCategory(category.id);
                
                // Find default unit for this category and select it
                const unites = await fetchData(`unites?categorieId=${category.id}`);
                const defaultUnit = unites.find(unit => unit.libelle === category.uniteDefault);
                if (defaultUnit) {
                    uniteSearchInput.value = defaultUnit.libelle;
                    uniteInput.value = defaultUnit.id;
                } else if (unites.length > 0) {
                    // If no default unit found but units exist, select the first one
                    uniteSearchInput.value = unites[0].libelle;
                    uniteInput.value = unites[0].id;
                } else {
                    // If no units exist for this category, clear unit selection
                    uniteSearchInput.value = '';
                    uniteInput.value = '';
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
        
        categorieSearchInput.parentNode.appendChild(suggestionList);
    };
    
    // Show dropdown when clicking on the input
    categorieSearchInput.addEventListener('click', () => {
        showCategorieDropdown();
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const existingList = document.getElementById('categorie-suggestions');
        if (existingList && !categorieSearchInput.contains(event.target) && !existingList.contains(event.target)) {
            existingList.remove();
        }
    });
}

// Function to load units for a specific category
async function loadUnitsForCategory(categoryId) {
    // Get all units for the category
    const unites = await fetchData(`unites?categorieId=${categoryId}`);
    
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
                uniteSearchInput.value = unite.libelle;
                uniteInput.value = unite.id;
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
        
        uniteSearchInput.parentNode.appendChild(suggestionList);
    };
    
    // Update click event for showing units dropdown
    uniteSearchInput.removeEventListener('click', uniteSearchInput.clickHandler);
    uniteSearchInput.clickHandler = showUniteDropdown;
    uniteSearchInput.addEventListener('click', uniteSearchInput.clickHandler);
}

async function loadUnites() {
    // This function will now only setup the initial click handler
    // The actual units will be loaded based on the selected category
    
    // Store the click handler on the element for later removal
    uniteSearchInput.clickHandler = () => {
        // If no category is selected, show a message
        if (!categorieInput.value) {
            alert('Veuillez d\'abord sélectionner une catégorie');
            return;
        }
        
        // If category is selected, load units for that category
        loadUnitsForCategory(categorieInput.value);
    };
    
    // Show dropdown when clicking on the input
    uniteSearchInput.addEventListener('click', uniteSearchInput.clickHandler);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const existingList = document.getElementById('unite-suggestions');
        if (existingList && !uniteSearchInput.contains(event.target) && !existingList.contains(event.target)) {
            existingList.remove();
        }
    });
}

async function loadFournisseurs() {
    const fournisseurs = await fetchData('fournisseurs');
    // Implement autocomplete and dropdown for fournisseur input
    const fournisseurNames = fournisseurs.map(f => `${f.prenom} ${f.nom}`);
    
    // Add dropdown functionality
    const showFournisseurDropdown = () => {
        // Clear previous suggestions
        const existingList = document.getElementById('fournisseur-suggestions');
        if (existingList) {
            existingList.remove();
        }
        
        const suggestionList = document.createElement('ul');
        suggestionList.id = 'fournisseur-suggestions';
        suggestionList.className = 'absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-lg max-h-60 overflow-y-auto shadow-lg';
        
        // Add all fournisseurs to dropdown
        fournisseurNames.forEach(name => {
            const li = document.createElement('li');
            li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
            li.textContent = name;
            li.addEventListener('click', () => {
                fournisseurInput.value = name;
                suggestionList.remove();
                saveFormData();
            });
            suggestionList.appendChild(li);
        });
        
        fournisseurInput.parentNode.appendChild(suggestionList);
    };
    
    // Show dropdown when clicking on the input
    fournisseurInput.addEventListener('click', () => {
        showFournisseurDropdown();
    });
    
    // Filter the dropdown when typing
    fournisseurInput.addEventListener('input', function() {
        const val = this.value.toLowerCase();
        const matchingFournisseurs = fournisseurNames.filter(name => 
            name.toLowerCase().includes(val)
        );
        
        // Clear previous suggestions
        const existingList = document.getElementById('fournisseur-suggestions');
        if (existingList) {
            existingList.remove();
        }
        
        if (matchingFournisseurs.length > 0) {
            const suggestionList = document.createElement('ul');
            suggestionList.id = 'fournisseur-suggestions';
            suggestionList.className = 'absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded-lg max-h-60 overflow-y-auto shadow-lg';
            
            matchingFournisseurs.forEach(name => {
                const li = document.createElement('li');
                li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer';
                li.textContent = name;
                li.addEventListener('click', () => {
                    fournisseurInput.value = name;
                    suggestionList.remove();
                    saveFormData();
                });
                suggestionList.appendChild(li);
            });
            
            fournisseurInput.parentNode.appendChild(suggestionList);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const existingList = document.getElementById('fournisseur-suggestions');
        if (existingList && !fournisseurInput.contains(event.target) && !existingList.contains(event.target)) {
            existingList.remove();
        }
    });
}

async function loadProduits() {
    const produits = await fetchData(`produits?_page=${currentPage}&_limit=${ITEMS_PER_PAGE}`);
    produitsTableBody.innerHTML = '';
    
    for (const produit of produits) {
        const tr = document.createElement('tr');
        tr.className = 'border-b';
        
        // Get related data
        const categorie = await fetchData(`categories/${produit.categorieId}`);
        const unite = await fetchData(`unites/${produit.uniteId}`);
        
        // Use directly the fournisseur name from the product
        const fournisseur = produit.fournisseur;
        
        // Create image thumbnail if available
        const imageHTML = produit.image ? 
            `<div class="w-12 h-12 rounded-md overflow-hidden">
                <img src="${produit.image}" class="w-full h-full object-cover" alt="${produit.libelle}">
            </div>` : 
            '<div class="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12a2 2 0 100-4 2 2 0 000 4z" /></svg></div>';
        
        tr.innerHTML = `
            <td class="px-4 py-3 flex items-center">
                ${imageHTML}
                <span class="ml-3">${produit.libelle}</span>
            </td>
            <td class="px-4 py-3">${categorie ? categorie.libelle : 'N/A'}</td>
            <td class="px-4 py-3">${produit.quantite}</td>
            <td class="px-4 py-3">${produit.prix}</td>
            <td class="px-4 py-3">${fournisseur}</td>
            <td class="px-4 py-3">${unite ? unite.libelle : 'N/A'}</td>
            <td class="px-4 py-3 flex space-x-2">
                <button class="edit-btn text-blue-600" data-id="${produit.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button class="delete-btn text-red-600" data-id="${produit.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </td>
        `;
        
        // Add event listeners to buttons
        const editBtn = tr.querySelector('.edit-btn');
        const deleteBtn = tr.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => editProduit(produit.id));
        deleteBtn.addEventListener('click', () => deleteProduit(produit.id));
        
        produitsTableBody.appendChild(tr);
    }
}

// Form handlers
async function handleProductSubmit() {
    if (!validateProductForm()) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const productData = {
        libelle: libelleInput.value,
        categorieId: parseInt(categorieInput.value),
        quantite: parseInt(quantiteInput.value),
        uniteId: parseInt(uniteInput.value),
        prix: parseInt(prixInput.value),
        fournisseur: fournisseurInput.value,
        reference: generateReferenceValue(),
        image: imagePreview.src || null
    };
    
    const result = await postData('produits', productData);
    if (result) {
        // Clear form storage after successful submission
        clearFormStorage();
        resetProductForm();
        loadProduits();
        alert('Produit ajouté avec succès!');
    } else {
        alert('Erreur lors de l\'ajout du produit');
    }
}

function validateProductForm() {
    return (
        libelleInput.value.trim() !== '' &&
        categorieInput.value !== '' &&
        quantiteInput.value.trim() !== '' &&
        uniteInput.value !== '' &&
        prixInput.value.trim() !== '' &&
        fournisseurInput.value.trim() !== ''
    );
}

function resetProductForm() {
    libelleInput.value = '';
    categorieInput.value = '';
    categorieSearchInput.value = '';
    
    // Disable unite add button
    addUniteBtn.disabled = true;
    addUniteBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    quantiteInput.value = '';
    uniteInput.value = '';
    uniteSearchInput.value = '';
    prixInput.value = '';
    fournisseurInput.value = '';
    referenceDisplay.textContent = 'Reference : ';
    // Reset image
    imagePreview.src = '';
    imagePreview.classList.add('hidden');
    imagePlaceholder.classList.remove('hidden');
}

// Modal handlers
function toggleModal(modal, show) {
    if (show) {
        // Save current form data before showing modal
        saveFormData();
        
        // Pre-fill the unite modal fields if opening unite modal
        if (modal === uniteModal) {
            const categorieId = categorieInput.value;
            const categorieName = categorieSearchInput.value;
            
            if (categorieId) {
                // Clear input fields
                uniteNameInput.value = '';
                uniteBaseInput.value = '';
                
                // Set category name in the modal title
                uniteCategorieNameSpan.textContent = categorieName;
                
                // Load existing units for this category
                loadExistingUnits(categorieId);
            }
        }
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Reset temporary data
        if (modal === uniteModal) {
            temporaryConversions = [];
            updateConversionsTable();
        }
    } else {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

// Load existing units for the selected category
async function loadExistingUnits(categorieId) {
    try {
        const response = await fetch(`${API_URL}/unites?categorieId=${categorieId}`);
        const unites = await response.json();
        
        // Add a select button to choose an existing unit for editing
        if (unites.length > 0) {
            // Create a list of existing units
            let html = '<div class="mt-4 mb-4"><h4 class="font-medium mb-2">Unités existantes:</h4>';
            html += '<div class="grid grid-cols-1 gap-2">';
            
            unites.forEach(unite => {
                html += `
                <div class="flex items-center justify-between p-2 border border-gray-300 rounded-md hover:bg-gray-100">
                    <div>
                        <span class="font-medium">${unite.libelle}</span>
                        <span class="text-gray-500 text-sm ml-2">(Base: ${unite.base})</span>
                    </div>
                    <div class="flex space-x-2">
                        <button type="button" class="edit-unit-btn text-blue-600 hover:text-blue-800" data-id="${unite.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button type="button" class="delete-unit-btn text-red-600 hover:text-red-800" data-id="${unite.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
                `;
            });
            
            html += '</div></div>';
            
            // Insert the list before the form fields
            const uniteFormFields = document.querySelector('#unite-form-fields');
            const existingUnitsContainer = document.getElementById('existing-units-container');
            
            if (existingUnitsContainer) {
                existingUnitsContainer.innerHTML = html;
            } else {
                const container = document.createElement('div');
                container.id = 'existing-units-container';
                container.innerHTML = html;
                uniteFormFields.parentNode.insertBefore(container, uniteFormFields);
            }
            
            // Add event listeners for edit and delete buttons
            document.querySelectorAll('.edit-unit-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const uniteId = btn.dataset.id;
                    const unite = unites.find(u => u.id == uniteId);
                    if (unite) {
                        editExistingUnit(unite);
                    }
                });
            });
            
            document.querySelectorAll('.delete-unit-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const uniteId = btn.dataset.id;
                    const unite = unites.find(u => u.id == uniteId);
                    if (unite) {
                        await deleteExistingUnit(unite);
                    }
                });
            });
            
            // Add section title and button to create a new unit
            const newUnitSection = document.getElementById('new-unit-section');
            if (!newUnitSection) {
                const section = document.createElement('div');
                section.id = 'new-unit-section';
                section.innerHTML = `
                <div class="mt-4 mb-2">
                    <h4 class="font-medium">Nouvelle unité ou modifier existante:</h4>
                    <p class="text-sm text-gray-500 mb-2">Utilisez les boutons ci-dessus pour éditer une unité existante, ou remplissez ce formulaire pour créer une nouvelle unité.</p>
                </div>
                `;
                uniteFormFields.parentNode.insertBefore(section, uniteFormFields);
            }
        } else {
            // No units found, clear any existing units display
            const existingUnitsContainer = document.getElementById('existing-units-container');
            if (existingUnitsContainer) {
                existingUnitsContainer.innerHTML = `
                <div class="mt-4 mb-4">
                    <p class="text-gray-500 italic">Aucune unité disponible pour cette catégorie.</p>
                </div>`;
            }
            
            // Update or add the section title for creating a new unit
            const newUnitSection = document.getElementById('new-unit-section');
            if (newUnitSection) {
                newUnitSection.innerHTML = `
                <div class="mt-4 mb-2">
                    <h4 class="font-medium">Ajouter une nouvelle unité:</h4>
                </div>`;
            } else {
                const section = document.createElement('div');
                section.id = 'new-unit-section';
                section.innerHTML = `
                <div class="mt-4 mb-2">
                    <h4 class="font-medium">Ajouter une nouvelle unité:</h4>
                </div>`;
                const uniteFormFields = document.querySelector('#unite-form-fields');
                uniteFormFields.parentNode.insertBefore(section, uniteFormFields);
            }
        }
    } catch (error) {
        console.error('Error loading existing units:', error);
    }
}

// Edit an existing unit
async function editExistingUnit(unite) {
    // Update the hidden input for unit ID
    uniteNameInput.value = unite.id;
    
    // Update form fields
    uniteNameInput.value = unite.libelle;
    uniteBaseInput.value = unite.base;
    uniteMultiplicateurInput.value = unite.multiplicateur;
    uniteSymboleInput.value = unite.symbole;
    
    // Update UI to show we're editing
    uniteModalTitle.textContent = `Modifier l'unité "${unite.libelle}"`;
    uniteSubmitBtn.textContent = 'Mettre à jour';
    
    // Load and display conversions
    await loadConversions(unite.id);
    
    // Scroll to the form
    document.querySelector('#unite-form-fields').scrollIntoView({ behavior: 'smooth' });
}

// Delete an existing unit
async function deleteExistingUnit(unite) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette unité?')) {
        // Check if there are any products using this unit
        const productsWithUnit = await fetchData(`produits?uniteId=${unite.id}`);
        
        if (productsWithUnit.length > 0) {
            alert('Impossible de supprimer cette unité car elle est utilisée par des produits');
            return;
        }
        
        const success = await deleteData('unites', unite.id);
        if (success) {
            // Reload units
            await loadExistingUnits(unite.categorieId);
            
            // If the deleted unit was selected, clear the selection
            if (uniteInput.value == unite.id) {
                uniteInput.value = '';
                uniteSearchInput.value = '';
            }
            
            // Reload units for the category in the main form
            await loadUnitsForCategory(unite.categorieId);
        } else {
            alert('Erreur lors de la suppression de l\'unité');
        }
    }
}

// Unite handlers
function addTemporaryConversion() {
    const libelle = libelleUniteInput.value.trim();
    const valeur = valeurConversionInput.value.trim();
    
    if (libelle === '' || valeur === '') {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    temporaryConversions.push({
        libelle,
        conversion: parseFloat(valeur)
    });
    
    libelleUniteInput.value = '';
    valeurConversionInput.value = '';
    
    updateConversionsTable();
}

function updateConversionsTable() {
    conversionsTableBody.innerHTML = '';
    
    temporaryConversions.forEach((conversion, index) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b';
        tr.innerHTML = `
            <td class="px-4 py-2">${conversion.libelle}</td>
            <td class="px-4 py-2">${conversion.conversion}</td>
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
            temporaryConversions.splice(index, 1);
            updateConversionsTable();
        });
        
        conversionsTableBody.appendChild(tr);
    });
    
    if (temporaryConversions.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="3" class="px-4 py-2 text-center text-gray-500 italic">Aucune conversion ajoutée</td>`;
        conversionsTableBody.appendChild(tr);
    }
}

async function handleUniteSubmit() {
    const categorieId = parseInt(categorieInput.value);
    if (!categorieId) {
        alert('Erreur: aucune catégorie sélectionnée');
        return;
    }
    
    const libelle = uniteNameInput.value.trim();
    const base = uniteBaseInput.value.trim();
    
    if (libelle === '' || base === '') {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Check if we're editing an existing unit or creating a new one
    const editId = uniteNameInput.dataset.editId;
    
    if (editId) {
        // Updating existing unit
        const uniteData = {
            id: parseInt(editId),
            libelle,
            base,
            categorieId,
            conversions: temporaryConversions
        };
        
        const response = await fetch(`${API_URL}/unites/${editId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uniteData),
        });
        
        if (response.ok) {
            // If the updated unit was selected, update the selection
            if (uniteInput.value == editId) {
                uniteSearchInput.value = libelle;
            }
            
            // Clear edit mode
            delete uniteNameInput.dataset.editId;
        } else {
            alert('Erreur lors de la mise à jour de l\'unité');
            return;
        }
    } else {
        // Creating new unit
        const uniteData = {
            libelle,
            base,
            categorieId,
            conversions: temporaryConversions
        };
        
        const result = await postData('unites', uniteData);
        if (!result) {
            alert('Erreur lors de l\'ajout de l\'unité');
            return;
        }
        
        // Set the newly created unite as selected
        uniteInput.value = result.id;
        uniteSearchInput.value = result.libelle;
    }
    
    // Reset form and close modal
    uniteNameInput.value = '';
    uniteBaseInput.value = '';
    temporaryConversions = [];
    
    // Reload units in both the modal and the main form
    await loadUnitsForCategory(categorieId);
    await loadExistingUnits(categorieId);
    
    saveFormData(); // Save form with new selection
    
    // Close modal if auto-close is desired
    // toggleModal(uniteModal, false);
}

// Categorie handlers
async function handleCategorieSubmit() {
    const libelle = categorieNameInput.value.trim();
    const uniteDefault = uniteDefaultInput.value.trim();
    const valeurDefault = valeurDefaultInput.value.trim();
    
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
    const categoryResult = await postData('categories', categorieData);
    if (categoryResult) {
        // Next, create a default unit for this category
        const uniteData = {
            libelle: uniteDefault,
            base: uniteDefault,
            categorieId: categoryResult.id,
            conversions: []
        };
        
        const unitResult = await postData('unites', uniteData);
        
        toggleModal(categorieModal, false);
        
        // Set the newly created category as selected
        categorieInput.value = categoryResult.id;
        categorieSearchInput.value = categoryResult.libelle;
        categorieSearchInput.dataset.uniteDefault = categoryResult.uniteDefault;
        categorieSearchInput.dataset.id = categoryResult.id;
        
        // Enable unite add button
        addUniteBtn.disabled = false;
        addUniteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        
        // Set the new unit as selected
        if (unitResult) {
            uniteInput.value = unitResult.id;
            uniteSearchInput.value = unitResult.libelle;
        }
        
        await loadUnitsForCategory(categoryResult.id);
        saveFormData();
        generateReference();
        
        categorieNameInput.value = '';
        uniteDefaultInput.value = '';
        valeurDefaultInput.value = '';
    } else {
        alert('Erreur lors de l\'ajout de la catégorie');
    }
}

// Fournisseur handlers
async function handleFournisseurSubmit() {
    const prenom = fournisseurPrenomInput.value.trim();
    const nom = fournisseurNomInput.value.trim();
    const telephone = fournisseurTelephoneInput.value.trim();
    const adresse = fournisseurAdresseInput.value.trim();
    
    if (prenom === '' || nom === '' || telephone === '' || adresse === '') {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    const fournisseurData = {
        prenom,
        nom,
        telephone,
        adresse
    };
    
    const result = await postData('fournisseurs', fournisseurData);
    if (result) {
        toggleModal(fournisseurModal, false);
        await loadFournisseurs();
        
        // Set the newly created fournisseur in the input
        fournisseurInput.value = `${prenom} ${nom}`;
        saveFormData(); // Save form with new supplier
        
        fournisseurPrenomInput.value = '';
        fournisseurNomInput.value = '';
        fournisseurTelephoneInput.value = '';
        fournisseurAdresseInput.value = '';
    } else {
        alert('Erreur lors de l\'ajout du fournisseur');
    }
}

// Image handling functions
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
        alert('Veuillez sélectionner une image');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('hidden');
        imagePlaceholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// Produit CRUD operations
async function editProduit(id) {
    const produit = await fetchData(`produits/${id}`);
    if (!produit) return;
    
    libelleInput.value = produit.libelle;
    
    // Set category
    const categorie = await fetchData(`categories/${produit.categorieId}`);
    if (categorie) {
        categorieInput.value = categorie.id;
        categorieSearchInput.value = categorie.libelle;
    }
    
    quantiteInput.value = produit.quantite;
    
    // Set unite
    const unite = await fetchData(`unites/${produit.uniteId}`);
    if (unite) {
        uniteInput.value = unite.id;
        uniteSearchInput.value = unite.libelle;
    }
    
    prixInput.value = produit.prix;
    fournisseurInput.value = produit.fournisseur;
    
    // Load image if it exists
    if (produit.image) {
        imagePreview.src = produit.image;
        imagePreview.classList.remove('hidden');
        imagePlaceholder.classList.add('hidden');
    } else {
        imagePreview.classList.add('hidden');
        imagePlaceholder.classList.remove('hidden');
    }
    
    // Change the button to update instead of create
    validerBtn.textContent = 'METTRE À JOUR';
    validerBtn.dataset.editId = id;
    
    // Replace the submit handler temporarily
    validerBtn.removeEventListener('click', handleProductSubmit);
    validerBtn.addEventListener('click', async () => {
        
        if (!validateProductForm()) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        const productData = {
            id,
            libelle: libelleInput.value,
            categorieId: parseInt(categorieInput.value),
            quantite: parseInt(quantiteInput.value),
            uniteId: parseInt(uniteInput.value),
            prix: parseInt(prixInput.value),
            fournisseur: fournisseurInput.value,
            reference: produit.reference,
            image: imagePreview.src || produit.image || null
        };
        
        const response = await fetch(`${API_URL}/produits/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        
        if (response.ok) {
            // Clear form storage after successful update
            clearFormStorage();
            resetProductForm();
            loadProduits();
            
            // Restore the button and handler
            validerBtn.textContent = 'VALIDER';
            delete validerBtn.dataset.editId;
            validerBtn.removeEventListener('click', handleProductSubmit);
            validerBtn.addEventListener('click', handleProductSubmit);
            
            alert('Produit mis à jour avec succès!');
        } else {
            alert('Erreur lors de la mise à jour du produit');
        }
    }, { once: true });
}

async function deleteProduit(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        const success = await deleteData('produits', id);
        if (success) {
            loadProduits();
            alert('Produit supprimé avec succès!');
        } else {
            alert('Erreur lors de la suppression du produit');
        }
    }
}

// Pagination
function updatePaginationButtons() {
    prevPageBtn.classList.toggle('disabled', currentPage === 1);
}

// Reference generation
function generateReference() {
    referenceDisplay.textContent = 'Reference : ' + generateReferenceValue();
}

function generateReferenceValue() {
    const libelle = libelleInput.value.trim();
    const categorieValue = categorieSearchInput.value.trim();
    
    if (!libelle || !categorieValue) {
        return '';
    }
    
    // Create a reference from the first 3 letters of categorie and libelle + random number
    const prefix = categorieValue.substring(0, 3) + '-' + libelle.substring(0, 5);
    const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    return `${prefix}-${suffix}`.toUpperCase();
}

// Form data persistence
function saveFormData() {
    const formData = {
        libelle: libelleInput.value,
        categorie: categorieInput.value,
        categorieText: categorieSearchInput.value,
        quantite: quantiteInput.value,
        unite: uniteInput.value,
        uniteText: uniteSearchInput.value,
        prix: prixInput.value,
        fournisseur: fournisseurInput.value,
        image: imagePreview.src || null
    };
    
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
}

function restoreFormData() {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        if (formData.libelle) libelleInput.value = formData.libelle;
        
        // First restore category, then load units for that category
        if (formData.categorie) {
            categorieInput.value = formData.categorie;
            
            if (formData.categorieText) {
                categorieSearchInput.value = formData.categorieText;
            }
            
            // Enable unite add button
            addUniteBtn.disabled = false;
            addUniteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            
            // Fetch category details to get uniteDefault
            fetchData(`categories/${formData.categorie}`).then(category => {
                if (category) {
                    categorieSearchInput.dataset.uniteDefault = category.uniteDefault || '';
                    categorieSearchInput.dataset.id = category.id;
                    
                    // Load units for this category
                    loadUnitsForCategory(category.id).then(() => {
                        // Restore unit selection after units are loaded
                        if (formData.unite) {
                            uniteInput.value = formData.unite;
                            if (formData.uniteText) {
                                uniteSearchInput.value = formData.uniteText;
                            }
                        }
                    });
                }
            });
        } else {
            addUniteBtn.disabled = true;
            addUniteBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        if (formData.quantite) quantiteInput.value = formData.quantite;
        if (formData.prix) prixInput.value = formData.prix;
        if (formData.fournisseur) fournisseurInput.value = formData.fournisseur;
        
        if (formData.image) {
            imagePreview.src = formData.image;
            imagePreview.classList.remove('hidden');
            imagePlaceholder.classList.add('hidden');
        }
        
        // Update reference display
        generateReference();
    } catch (error) {
        console.error('Error restoring form data:', error);
    }
}

function clearFormStorage() {
    localStorage.removeItem(FORM_STORAGE_KEY);
} 
import * as dom from '../ui/dom.js';
import * as api from '../api/api.js';
import { clearFormStorage } from '../utils/storage.js';
import { resetProductForm, generateReferenceValue, validateProductForm } from '../utils/helpers.js';

let currentPage = 1;
const ITEMS_PER_PAGE = 10;

// Load products with pagination
export async function loadProduits() {
    const produits = await api.fetchData(`produits?_page=${currentPage}&_limit=${ITEMS_PER_PAGE}`);
    dom.produitsTableBody.innerHTML = '';
    
    for (const produit of produits) {
        const tr = document.createElement('tr');
        tr.className = 'border-b';
        
        // Get related data
        const categorie = await api.fetchData(`categories/${produit.categorieId}`);
        const unite = await api.fetchData(`unites/${produit.uniteId}`);
        
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
        
        dom.produitsTableBody.appendChild(tr);
    }
    
    // Update pagination buttons
    updatePaginationButtons();
}

// Update pagination buttons
function updatePaginationButtons() {
    dom.prevPageBtn.classList.toggle('disabled', currentPage === 1);
}

// Handle pagination events
export function setupPagination() {
    dom.prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProduits();
            updatePaginationButtons();
        }
    });
    
    dom.nextPageBtn.addEventListener('click', () => {
        currentPage++;
        loadProduits();
        updatePaginationButtons();
    });
}

// Handle product form submission
export async function handleProductSubmit() {
    if (!validateProductForm()) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    const productData = {
        libelle: dom.libelleInput.value,
        categorieId: parseInt(dom.categorieInput.value),
        quantite: parseInt(dom.quantiteInput.value),
        uniteId: parseInt(dom.uniteInput.value),
        prix: parseInt(dom.prixInput.value),
        fournisseur: dom.fournisseurInput.value,
        reference: generateReferenceValue(),
        image: dom.imagePreview.src || null
    };
    
    const result = await api.postData('produits', productData);
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

// Edit a product
export async function editProduit(id) {
    const produit = await api.fetchData(`produits/${id}`);
    if (!produit) return;
    
    dom.libelleInput.value = produit.libelle;
    
    // Set category
    const categorie = await api.fetchData(`categories/${produit.categorieId}`);
    if (categorie) {
        dom.categorieInput.value = categorie.id;
        dom.categorieSearchInput.value = categorie.libelle;
    }
    
    dom.quantiteInput.value = produit.quantite;
    
    // Set unite
    const unite = await api.fetchData(`unites/${produit.uniteId}`);
    if (unite) {
        dom.uniteInput.value = unite.id;
        dom.uniteSearchInput.value = unite.libelle;
    }
    
    dom.prixInput.value = produit.prix;
    dom.fournisseurInput.value = produit.fournisseur;
    
    // Load image if it exists
    if (produit.image) {
        dom.imagePreview.src = produit.image;
        dom.imagePreview.classList.remove('hidden');
        dom.imagePlaceholder.classList.add('hidden');
    } else {
        dom.imagePreview.classList.add('hidden');
        dom.imagePlaceholder.classList.remove('hidden');
    }
    
    // Change the button to update instead of create
    dom.validerBtn.textContent = 'METTRE À JOUR';
    dom.validerBtn.dataset.editId = id;
    
    // Replace the submit handler temporarily
    dom.validerBtn.removeEventListener('click', handleProductSubmit);
    dom.validerBtn.addEventListener('click', async () => {
        
        if (!validateProductForm()) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        const productData = {
            id,
            libelle: dom.libelleInput.value,
            categorieId: parseInt(dom.categorieInput.value),
            quantite: parseInt(dom.quantiteInput.value),
            uniteId: parseInt(dom.uniteInput.value),
            prix: parseInt(dom.prixInput.value),
            fournisseur: dom.fournisseurInput.value,
            reference: produit.reference,
            image: dom.imagePreview.src || produit.image || null
        };
        
        const response = await fetch(`${api.API_URL}/produits/${id}`, {
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
            dom.validerBtn.textContent = 'VALIDER';
            delete dom.validerBtn.dataset.editId;
            dom.validerBtn.removeEventListener('click', handleProductSubmit);
            dom.validerBtn.addEventListener('click', handleProductSubmit);
            
            alert('Produit mis à jour avec succès!');
        } else {
            alert('Erreur lors de la mise à jour du produit');
        }
    }, { once: true });
}

// Delete a product
export async function deleteProduit(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        const success = await api.deleteData('produits', id);
        if (success) {
            loadProduits();
            alert('Produit supprimé avec succès!');
        } else {
            alert('Erreur lors de la suppression du produit');
        }
    }
}
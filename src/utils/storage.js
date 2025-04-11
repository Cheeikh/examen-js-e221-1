import { FORM_STORAGE_KEY } from '../constants.js';
import * as dom from '../ui/dom.js';

// Form data persistence
export function saveFormData() {
    const formData = {
        libelle: dom.libelleInput.value,
        categorie: dom.categorieInput.value,
        categorieText: dom.categorieSearchInput.value,
        quantite: dom.quantiteInput.value,
        unite: dom.uniteInput.value,
        uniteText: dom.uniteSearchInput.value,
        prix: dom.prixInput.value,
        fournisseur: dom.fournisseurInput.value,
        image: dom.imagePreview.src || null
    };
    
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
}

export function restoreFormData(loadUnitsForCategory) {
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        if (formData.libelle) dom.libelleInput.value = formData.libelle;
        
        // First restore category, then load units for that category
        if (formData.categorie) {
            dom.categorieInput.value = formData.categorie;
            
            if (formData.categorieText) {
                dom.categorieSearchInput.value = formData.categorieText;
            }
            
            // Enable unite add button
            dom.addUniteBtn.disabled = false;
            dom.addUniteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            
            // Fetch category details to get uniteDefault
            import('../api/api.js').then(api => {
                api.fetchData(`categories/${formData.categorie}`).then(category => {
                    if (category) {
                        dom.categorieSearchInput.dataset.uniteDefault = category.uniteDefault || '';
                        dom.categorieSearchInput.dataset.id = category.id;
                        
                        // Load units for this category
                        loadUnitsForCategory(category.id).then(() => {
                            // Restore unit selection after units are loaded
                            if (formData.unite) {
                                dom.uniteInput.value = formData.unite;
                                if (formData.uniteText) {
                                    dom.uniteSearchInput.value = formData.uniteText;
                                }
                            }
                        });
                    }
                });
            });
        } else {
            dom.addUniteBtn.disabled = true;
            dom.addUniteBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        
        if (formData.quantite) dom.quantiteInput.value = formData.quantite;
        if (formData.prix) dom.prixInput.value = formData.prix;
        if (formData.fournisseur) dom.fournisseurInput.value = formData.fournisseur;
        
        if (formData.image) {
            dom.imagePreview.src = formData.image;
            dom.imagePreview.classList.remove('hidden');
            dom.imagePlaceholder.classList.add('hidden');
        }
        
        // Update reference display
        import('./helpers.js').then(helpers => {
            helpers.generateReference();
        });
    } catch (error) {
        console.error('Error restoring form data:', error);
    }
}

export function clearFormStorage() {
    localStorage.removeItem(FORM_STORAGE_KEY);
}
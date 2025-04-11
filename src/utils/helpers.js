import * as dom from '../ui/dom.js';

// Reference generation
export function generateReference() {
    dom.referenceDisplay.textContent = 'Reference : ' + generateReferenceValue();
}

export function generateReferenceValue() {
    const libelle = dom.libelleInput.value.trim();
    const categorieValue = dom.categorieSearchInput.value.trim();
    
    if (!libelle || !categorieValue) {
        return '';
    }
    
    // Create a reference from the first 3 letters of categorie and libelle + random number
    const prefix = categorieValue.substring(0, 3) + '-' + libelle.substring(0, 5);
    const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    return `${prefix}-${suffix}`.toUpperCase();
}

// Image handling functions
export function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
        alert('Veuillez sélectionner une image');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        dom.imagePreview.src = e.target.result;
        dom.imagePreview.classList.remove('hidden');
        dom.imagePlaceholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// Pagination
export function updatePaginationButtons(currentPage) {
    dom.prevPageBtn.classList.toggle('disabled', currentPage === 1);
}

// Form reset
export function resetProductForm() {
    dom.libelleInput.value = '';
    dom.categorieInput.value = '';
    dom.categorieSearchInput.value = '';
    
    // Disable unite add button
    dom.addUniteBtn.disabled = true;
    dom.addUniteBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    dom.quantiteInput.value = '';
    dom.uniteInput.value = '';
    dom.uniteSearchInput.value = '';
    dom.prixInput.value = '';
    dom.fournisseurInput.value = '';
    dom.referenceDisplay.textContent = 'Reference : ';
    
    // Reset image
    dom.imagePreview.src = '';
    dom.imagePreview.classList.add('hidden');
    dom.imagePlaceholder.classList.remove('hidden');
}

// Form validation
export function validateProductForm() {
    return (
        dom.libelleInput.value.trim() !== '' &&
        dom.categorieInput.value !== '' &&
        dom.quantiteInput.value.trim() !== '' &&
        dom.uniteInput.value !== '' &&
        dom.prixInput.value.trim() !== '' &&
        dom.fournisseurInput.value.trim() !== ''
    );
}
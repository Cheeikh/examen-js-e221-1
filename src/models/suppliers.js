import * as dom from '../ui/dom.js';
import * as api from '../api/api.js';
import { toggleModal } from '../ui/modals.js';
import { saveFormData } from '../utils/storage.js';

// Load all suppliers
export async function loadFournisseurs() {
    const fournisseurs = await api.fetchData('fournisseurs');
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
                dom.fournisseurInput.value = name;
                suggestionList.remove();
                saveFormData();
            });
            suggestionList.appendChild(li);
        });
        
        dom.fournisseurInput.parentNode.appendChild(suggestionList);
    };
    
    // Show dropdown when clicking on the input
    dom.fournisseurInput.addEventListener('click', () => {
        showFournisseurDropdown();
    });
    
    // Filter the dropdown when typing
    dom.fournisseurInput.addEventListener('input', function() {
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
                    dom.fournisseurInput.value = name;
                    suggestionList.remove();
                    saveFormData();
                });
                suggestionList.appendChild(li);
            });
            
            dom.fournisseurInput.parentNode.appendChild(suggestionList);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const existingList = document.getElementById('fournisseur-suggestions');
        if (existingList && !dom.fournisseurInput.contains(event.target) && !existingList.contains(event.target)) {
            existingList.remove();
        }
    });
}

// Handle supplier submit
export async function handleFournisseurSubmit() {
    const prenom = dom.fournisseurPrenomInput.value.trim();
    const nom = dom.fournisseurNomInput.value.trim();
    const telephone = dom.fournisseurTelephoneInput.value.trim();
    const adresse = dom.fournisseurAdresseInput.value.trim();
    
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
    
    const result = await api.postData('fournisseurs', fournisseurData);
    if (result) {
        toggleModal(dom.fournisseurModal, false);
        await loadFournisseurs();
        
        // Set the newly created fournisseur in the input
        dom.fournisseurInput.value = `${prenom} ${nom}`;
        saveFormData(); // Save form with new supplier
        
        dom.fournisseurPrenomInput.value = '';
        dom.fournisseurNomInput.value = '';
        dom.fournisseurTelephoneInput.value = '';
        dom.fournisseurAdresseInput.value = '';
    } else {
        alert('Erreur lors de l\'ajout du fournisseur');
    }
}
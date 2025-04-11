// DOM Elements
export const productForm = document.querySelector('.bg-white.p-6');
export const libelleInput = document.getElementById('libelle');
export const categorieInput = document.getElementById('categorie');
export const categorieSearchInput = document.getElementById('categorie-search');
export const addCategorieBtn = document.getElementById('add-categorie');
export const quantiteInput = document.getElementById('quantite');
export const uniteInput = document.getElementById('unite');
export const uniteSearchInput = document.getElementById('unite-search');
export const addUniteBtn = document.getElementById('add-unite');
export const prixInput = document.getElementById('prix');
export const fournisseurInput = document.getElementById('fournisseur-search');
export const addFournisseurBtn = document.getElementById('add-fournisseur');
export const validerBtn = document.getElementById('valider');
export const produitsTableBody = document.getElementById('produits-table-body');
export const prevPageBtn = document.getElementById('prev-page');
export const nextPageBtn = document.getElementById('next-page');
export const referenceDisplay = document.getElementById('reference-display');
export const productImageInput = document.getElementById('product-image');
export const imagePreview = document.getElementById('image-preview');
export const imagePlaceholder = document.getElementById('image-placeholder');
export const uniteCategorieNameSpan = document.getElementById('unite-categorie-name');

// Modal Elements
export const uniteModal = document.getElementById('unite-modal');
export const uniteModalTitle = document.getElementById('unite-modal-title');
export const uniteNameInput = document.getElementById('unite-name');
export const uniteBaseInput = document.getElementById('unite-base');
export const uniteMultiplicateurInput = document.getElementById('unite-multiplicateur') || { value: '' };
export const uniteSymboleInput = document.getElementById('unite-symbole') || { value: '' };
export const newUniteLibelleInput = document.getElementById('new-unite-libelle');
export const newUniteBaseInput = document.getElementById('new-unite-base');
export const existingUnitsTableBody = document.getElementById('existing-units-table-body');
export const libelleUniteInput = document.getElementById('libelle-unite');
export const valeurConversionInput = document.getElementById('valeur-conversion');
export const addConversionBtn = document.getElementById('add-conversion');
export const conversionsTableBody = document.getElementById('conversions-table-body');
export const saveUniteBtn = document.getElementById('save-unite');
export const cancelUniteBtn = document.getElementById('cancel-unite');

export const categorieModal = document.getElementById('categorie-modal');
export const categorieNameInput = document.getElementById('categorie-name');
export const uniteDefaultInput = document.getElementById('unite-default');
export const valeurDefaultInput = document.getElementById('valeur-default');
export const saveCategorieBtn = document.getElementById('save-categorie');
export const cancelCategorieBtn = document.getElementById('cancel-categorie');

export const fournisseurModal = document.getElementById('fournisseur-modal');
export const fournisseurPrenomInput = document.getElementById('fournisseur-prenom');
export const fournisseurNomInput = document.getElementById('fournisseur-nom');
export const fournisseurTelephoneInput = document.getElementById('fournisseur-telephone');
export const fournisseurAdresseInput = document.getElementById('fournisseur-adresse');
export const saveFournisseurBtn = document.getElementById('save-fournisseur');
export const cancelFournisseurBtn = document.getElementById('cancel-fournisseur');

// DOM elements for units
export const defaultUnitName = document.getElementById('default-unit-name');
export const defaultUnitBase = document.getElementById('default-unit-base');
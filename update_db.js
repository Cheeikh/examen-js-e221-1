const fs = require('fs');

// Read the current db.json
const db = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'));

// Add categorieId and isDefault properties to units if missing
db.unites.forEach(unit => {
  // For "mètre" unit - connect to Tissu category
  if (unit.libelle === "mètre" && !unit.categorieId) {
    unit.categorieId = 1; // Tissu category
    unit.isDefault = true;
  }
  
  // For "yard" unit - add isDefault if missing
  if (unit.libelle === "yard" && unit.categorieId === 2 && !unit.isDefault) {
    unit.isDefault = true;
  }
});

// Write the updated db.json
fs.writeFileSync('./db/db.json', JSON.stringify(db, null, 2));

console.log('Database updated successfully'); 
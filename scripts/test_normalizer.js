import fs from 'fs';
import Fuse from 'fuse.js';

const techStats = JSON.parse(fs.readFileSync('./src/data/tech-statistics.json', 'utf8'));
const moveonUnis = JSON.parse(fs.readFileSync('./moveon-unis.json', 'utf8'));

const UNIVERSITY_ALIASES = {
  "Institute of Science Tokyo": "Tokyo Institute of Technology",
  "Ceské vysoké ucení technické v Praze": "Czech Technical University (CTU) in Prague",
  "Vysoké Ucení Technické v Brne": "Brno University of Technology",
  "Universidad Politécnica de Valencia": "Universidad Politécnica de Valencia", // ETSII is attached to this?
  "Texas A&M University": "Texas A & M University",
  "Università degli Studi di Roma \"La Sapienza\"": "Università degli Studi di Roma 'La Sapienza'",
  "Vysoká Skola Chemicko-Technologická v Praze": "Vysoká Skola Chemicko-Technologická v Praze (UCT Prague)"
};

// Normalize names function
const normalize = (name) => {
  if (!name) return "";
  return name.replace(/[\u2010-\u2015\-]/g, '-')
             .replace(/['"“”]/g, "'")
             .replace(/\s+/g, " ")
             .toLowerCase();
};

const matchedTechStats = new Set();

for (const uni of moveonUnis) {
  let searchName = UNIVERSITY_ALIASES[uni.name] || uni.name;
  searchName = normalize(searchName);

  let match = techStats.find(stat => {
    const statName = normalize(stat.university_name);
    return searchName.includes(statName) || statName.includes(searchName);
  });

  if (!match) {
    const fuse = new Fuse(techStats, {
      keys: ['university_name', 'original_name'],
      threshold: 0.15,
      ignoreLocation: true,
      minMatchCharLength: 5,
    });
    // Search using the alias if available, else original
    const query = UNIVERSITY_ALIASES[uni.name] || uni.name;
    const results = fuse.search(query);
    if (results.length > 0) {
      match = results[0].item;
    }
  }

  if (match) {
    matchedTechStats.add(match.original_name);
    // Add all variations for this MoveON uni
    techStats.forEach(stat => {
      const statName = normalize(stat.university_name);
      if (searchName.includes(statName) || statName.includes(searchName)) {
        matchedTechStats.add(stat.original_name);
      }
    });
  }
}

const missing = techStats.filter(stat => !matchedTechStats.has(stat.original_name));
console.log(`Unused stats count: ${missing.length}`);
const uniqueMissing = [...new Set(missing.map(m => m.university_name))];
uniqueMissing.forEach(n => console.log(n));

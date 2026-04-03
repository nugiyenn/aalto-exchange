import fs from 'fs';
import Fuse from 'fuse.js';

const techStats = JSON.parse(fs.readFileSync('./src/data/tech-statistics.json', 'utf8'));
const moveonUnis = JSON.parse(fs.readFileSync('./moveon-unis.json', 'utf8'));

const UNIVERSITY_ALIASES = {
  "Institute of Science Tokyo": "Tokyo Institute of Technology",
};

// Which tech stats do not map to ANY moveon uni?
// That means the tech stat's university is entirely missing from the frontend.

const matchedTechStats = new Set();

for (const uni of moveonUnis) {
  const searchName = UNIVERSITY_ALIASES[uni.name] || uni.name;
  
  let match = techStats.find(stat => 
    searchName.toLowerCase().includes(stat.university_name.toLowerCase()) || 
    stat.university_name.toLowerCase().includes(searchName.toLowerCase())
  );

  if (!match) {
    const fuse = new Fuse(techStats, {
      keys: ['university_name', 'original_name'],
      threshold: 0.15,
      ignoreLocation: true,
      minMatchCharLength: 5,
    });
    const results = fuse.search(searchName);
    if (results.length > 0) {
      match = results[0].item;
    }
  }

  if (match) {
    // Let's add ALL tech stats that match this uni name
    techStats.forEach(stat => {
      if (searchName.toLowerCase().includes(stat.university_name.toLowerCase()) || 
          stat.university_name.toLowerCase().includes(searchName.toLowerCase())) {
        matchedTechStats.add(stat.original_name);
      }
    });
  }
}

const completelyMissing = techStats.filter(stat => !matchedTechStats.has(stat.original_name));

console.log("Tech stats completely missing from frontend:");
const uniqueMissingNames = [...new Set(completelyMissing.map(m => m.university_name))];
uniqueMissingNames.forEach(name => console.log(name));

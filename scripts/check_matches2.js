import fs from 'fs';
import Fuse from 'fuse.js';

async function check() {
  const techStats = JSON.parse(fs.readFileSync('./src/data/tech-statistics.json', 'utf8'));
  const moveonUnis = JSON.parse(fs.readFileSync('./moveon-unis.json', 'utf8'));

  const UNIVERSITY_ALIASES = {
    "Institute of Science Tokyo": "Tokyo Institute of Technology"
  };

  let matchCount = 0;
  const matchedTechStats = new Set();
  const unmappedMoveOn = [];

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
      matchCount++;
      matchedTechStats.add(match.original_name);
    } else {
      unmappedMoveOn.push(uni.name);
    }
  }

  const missingTechStats = techStats.filter(stat => !matchedTechStats.has(stat.original_name));

  console.log(`MoveON Unis mapped: ${matchCount} / ${moveonUnis.length}`);
  console.log(`Tech Stats used: ${matchedTechStats.size} / ${techStats.length}`);
  
  console.log("\nTech Stats that are NEVER used:");
  missingTechStats.forEach(m => console.log(` - ${m.university_name} (original: ${m.original_name})`));
}

check();

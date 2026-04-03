import fs from 'fs';
import Fuse from 'fuse.js';

const techStats = JSON.parse(fs.readFileSync('./src/data/tech-statistics.json', 'utf8'));
const moveonUnis = JSON.parse(fs.readFileSync('./moveon-unis.json', 'utf8'));

const UNIVERSITY_ALIASES = {
  "Institute of Science Tokyo": "Tokyo Institute of Technology",
  "Kyoto University": "Kyoto University",
};

const unmatchedMoveon = [];

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

  // we only care if this uni ACTUALLY has a stat in the tech-stats
  // let's loosely see if any tech-stat seems to mention this uni
  const looseMatch = techStats.find(stat => 
    stat.university_name.toLowerCase().includes(searchName.toLowerCase().split(' ')[0]) && 
    stat.university_name.toLowerCase().includes(searchName.toLowerCase().split(' ')[1] || '')
  );

  if (!match && looseMatch) {
    unmatchedMoveon.push({ moveon: uni.name, potentialStat: looseMatch.university_name });
  }
}

console.log(unmatchedMoveon);

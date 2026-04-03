import fs from 'fs';
import Fuse from 'fuse.js';

async function check() {
  const techStats = JSON.parse(fs.readFileSync('./src/data/tech-statistics.json', 'utf8'));
  
  // Fetch from MoveON API
  const formData = new URLSearchParams();
  formData.append('action', 'load_report_data_on_ajax_load');
  formData.append('searched_data[publisher_id]', '11');
  formData.append('ajaxload', '0');

  const res = await fetch('https://aalto.adv-pub.moveon4.de/ap-dashboard/admin-ajax.php', {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  const textData = await res.text();
  const jsonMatch = textData.match(/\{[\s\S]*\}/);
  const data = JSON.parse(jsonMatch[0]);
  const moveonUnis = data.labelvalue || [];

  const UNIVERSITY_ALIASES = {
    "Institute of Science Tokyo": "Tokyo Institute of Technology"
  };

  const matchedStats = new Set();

  for (const moveonUni of moveonUnis) {
    const originalName = moveonUni.universityname;
    const searchName = UNIVERSITY_ALIASES[originalName] || originalName;
    
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
      matchedStats.add(match.original_name);
    }
  }

  const missing = techStats.filter(stat => !matchedStats.has(stat.original_name));
  console.log(`Found ${matchedStats.size} matches. ${missing.length} stats have no corresponding MoveON university.`);
  
  console.log("Missing Stats (from PDF that didn't map to a MoveON uni):");
  missing.forEach(m => console.log(" - " + m.university_name));
}

check();

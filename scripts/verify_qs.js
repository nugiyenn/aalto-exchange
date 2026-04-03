import fs from 'fs';

const rankings = JSON.parse(fs.readFileSync('src/data/rankings2026.json', 'utf8'));
const qsData = JSON.parse(fs.readFileSync('qs_parsed.json', 'utf8'));

// Print all the matched pairs to review
for (const [uniName, rank] of Object.entries(rankings)) {
    const qsMatch = qsData.find(q => q.rank === rank);
    console.log(`${uniName} -> ${qsMatch ? qsMatch.name : 'Unknown'} (Rank ${rank})`);
}

import fs from 'fs';
import Fuse from 'fuse.js';

const qsData = JSON.parse(fs.readFileSync('qs_parsed.json', 'utf8'));
const moveonUnis = JSON.parse(fs.readFileSync('moveon-unis.json', 'utf8'));

const QS_ALIASES = {
  "Institute of Science Tokyo": "Tokyo Institute of Technology",
  "Ceské Vysoké Uceni Technické v Praze": "Czech Technical University in Prague",
  "Vysoké Ucení Technické v Brne": "Brno University of Technology",
  "University of Chemistry and Technology, Prague": "University of Chemistry and Technology, Prague",
  "IE Universidad": "IE University",
  "Universitat Politècnica de València": "Universitat Politecnica de Valencia",
  "Texas A&M University": "Texas A&M University",
  "KTH Royal Institute of Technology": "KTH Royal Institute of Technology",
  "National University of Singapore": "National University of Singapore (NUS)",
  "Nanyang Technological University": "Nanyang Technological University, Singapore (NTU Singapore)",
  "The Chinese University of Hong Kong, Shenzhen": "The Chinese University of Hong Kong (CUHK)",
  "University of Melbourne": "The University of Melbourne",
  "University of Sydney": "The University of Sydney",
  "University of Hong Kong": "The University of Hong Kong",
  "University of Queensland": "The University of Queensland",
  "University of New South Wales": "The University of New South Wales (UNSW Sydney)",
  "Technische Universität München (TUM)": "Technical University of Munich",
  "Technische Universität Berlin": "Technical University of Berlin (TUB)",
  "Rheinisch-Westfälische Technische Hochschule Aachen": "RWTH Aachen University",
  "Technische Universität Darmstadt": "Technical University of Darmstadt",
  "Technische Universität Dresden": "TUD Dresden University of Technology",
  "Karlsruher Institut für Technologie": "Karlsruhe Institute of Technology (KIT)",
  "Politecnico di Milano": "Politecnico di Milano",
  "Politecnico di Torino": "Politecnico di Torino",
  "Technische Universiteit Delft": "Delft University of Technology",
  "Technische Universiteit Eindhoven": "Eindhoven University of Technology",
  "Universiteit Twente": "University of Twente",
  "Universidade de Lisboa": "University of Lisbon",
  "Universidade do Porto": "University of Porto",
  "Universidade de Coimbra": "University of Coimbra",
  "Chalmers tekniska högskola": "Chalmers University of Technology",
  "Lunds universitet": "Lund University",
  "Norges Teknisk-Naturvitenskapelige Universitet": "Norwegian University of Science And Technology",
  "Danmarks Tekniske Universitet (DTU)": "Technical University of Denmark",
  "Aalborg Universitet": "Aalborg University",
  "Oulun yliopisto": "University of Oulu",
  "Tampereen yliopisto": "Tampere University",
  "Lappeenrannan-Lahden teknillinen yliopisto LUT": "LUT University",
  "École Polytechnique Fédérale de Lausanne": "EPFL",
  "Eidgenössische Technische Hochschule Zürich": "ETH Zurich",
  "Korea Advanced Institute of Science and Technology": "Korea Advanced Institute of Science and Technology (KAIST)",
  "UNIVERSITA DEGLI STUDI DI ROMA LA SAPIENZA": "Sapienza University of Rome",
  "Namibia University of Science and Technology": "Namibia University of Science and Technology",
  "Institut National des Sciences Appliquees de Rennes": "INSA Rennes",
  "Institut National des Sciences Appliquees de Strasbourg": "INSA Strasbourg",
  "Institut National des Sciences Appliquees de Toulouse": "INSA Toulouse",
};

const normalize = (name) => {
  if (!name) return "";
  return name.replace(/[\u2010-\u2015\-]/g, '-')
             .replace(/['"“”]/g, "'")
             .replace(/\s+/g, " ")
             .toLowerCase()
             .replace(/\(.*\)/, '') // remove parens
             .trim();
};

const rankings = {};

for (const uni of moveonUnis) {
  if (rankings[uni.name]) continue;

  let searchName = QS_ALIASES[uni.name] || uni.name;
  let normalizedSearch = normalize(searchName);

  let match = qsData.find(qs => {
    const qsName = normalize(qs.name);
    return normalizedSearch === qsName || 
           qsName.startsWith(normalizedSearch) || 
           normalizedSearch.startsWith(qsName);
  });

  if (!match) {
    const fuse = new Fuse(qsData, {
      keys: ['name'],
      threshold: 0.1, // somewhat strict
      ignoreLocation: true,
      minMatchCharLength: 5,
    });
    const results = fuse.search(searchName);
    if (results.length > 0) {
      match = results[0].item;
    }
  }

  if (match) {
    if (uni.name === "Indian Institute of Technology Bombay (IIT Bombay)" && match.name.includes("Indore")) continue;
    if (uni.name === "Indian Institute of Technology Madras (IIT Madras)" && match.name.includes("Indore")) continue;
    rankings[uni.name] = match.rank;
  }
}

fs.writeFileSync('src/data/rankings2026.json', JSON.stringify(rankings, null, 2));
console.log(`Saved mappings to src/data/rankings2026.json`);

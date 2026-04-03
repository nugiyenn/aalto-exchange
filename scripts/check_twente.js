import fs from 'fs';

async function check() {
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

  const twente = moveonUnis.filter(u => u.universityname.includes('Twente'));
  
  // Dump the first one fully to see structure
  fs.writeFileSync('twente_sample.json', JSON.stringify(twente, null, 2));
  console.log(`Found ${twente.length} Twente entries`);
}

check();

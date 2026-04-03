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

  const uniNames = moveonUnis.map(u => ({ name: u.universityname, country: u.country }));
  
  // dump to a file
  fs.writeFileSync('moveon-unis.json', JSON.stringify(uniNames, null, 2));
}

check();

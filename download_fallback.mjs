import fs from 'fs';

async function download() {
  try {
    const formData = new URLSearchParams();
    formData.append('action', 'load_report_data_on_ajax_load');
    formData.append('searched_data[publisher_id]', '11');

    const res = await fetch('https://aalto.adv-pub.moveon4.de/ap-dashboard/admin-ajax.php', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const textData = await res.text();
    const jsonMatch = textData.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from API response");
    }
    const data = JSON.parse(jsonMatch[0]);
    
    // Ensure dir exists
    if (!fs.existsSync('src/data')) {
      fs.mkdirSync('src/data', { recursive: true });
    }
    fs.writeFileSync('src/data/fallback_universities.json', JSON.stringify(data));
    console.log("Successfully downloaded fallback data!");
  } catch (error) {
    console.error("Error downloading data:", error);
  }
}

download();

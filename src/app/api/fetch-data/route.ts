import { NextResponse } from 'next/server';
import { RawUniversity } from '../../../types/university';
import { enrichUniversityData } from '../../../lib/data-processor';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { schoolId } = await request.json().catch(() => ({ schoolId: null }));

    const formData = new URLSearchParams();
    formData.append('action', 'load_report_data_on_ajax_load');
    formData.append('searched_data[publisher_id]', '11');
    formData.append('ajaxload', '0');

    if (schoolId) {
      formData.append('searched_data[relation_internal_institution_ids]', schoolId.toString());
    }

    let data;
    try {
      const res = await fetch('https://aalto.adv-pub.moveon4.de/ap-dashboard/admin-ajax.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch from MoveON: ${res.statusText}`);
      }
      data = await res.json();
    } catch (fetchError) {
      console.warn("Live API failed, falling back to static data...", fetchError);
      const fallbackPath = path.join(process.cwd(), 'src/data/fallback_universities.json');
      const fileData = fs.readFileSync(fallbackPath, 'utf-8');
      data = JSON.parse(fileData);
    }

    const labelvalue: RawUniversity[] = data?.labelvalue || [];

    const universities = enrichUniversityData(labelvalue);

    return NextResponse.json(universities);
  } catch (error) {
    console.error('Error fetching data from proxy:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}


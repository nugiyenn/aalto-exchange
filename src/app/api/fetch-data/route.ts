import { NextResponse } from 'next/server';
import { RawUniversity } from '../../../types/university';
import { enrichUniversityData } from '../../../lib/data-processor';

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

    const data = await res.json();
    const labelvalue: RawUniversity[] = data?.labelvalue || [];

    const universities = enrichUniversityData(labelvalue);

    return NextResponse.json(universities);
  } catch (error) {
    console.error('Error fetching data from proxy:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}


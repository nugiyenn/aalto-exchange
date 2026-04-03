import { NextResponse } from 'next/server';
import { RawUniversity, RawRelation, RawInstitution } from '../../../types/university';

export async function POST(request: Request) {
  try {
    const { coreId, relationId } = await request.json();

    if (!coreId || !relationId) {
      return NextResponse.json({ error: 'Missing IDs' }, { status: 400 });
    }

    const formData = new URLSearchParams();
    formData.append('action', 'load_report_data_on_ajax_load');
    formData.append('searched_data[publisher_id]', '11');
    formData.append('searched_data[core_id]', coreId.toString());
    formData.append('searched_data[relation_id]', relationId.toString());
    formData.append('ajaxload', '0');

    const res = await fetch('https://aalto.adv-pub.moveon4.de/ap-dashboard/admin-ajax.php', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch details: ${res.statusText}`);
    }

    const textData = await res.text();
    const jsonMatch = textData.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from API response");
    }
    const data = JSON.parse(jsonMatch[0]);
    
    const uni: RawUniversity = data?.labelvalue?.[0];
    if (!uni) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const relationsRaw = uni.informatics?.[0]?.relations || [];
    const institutionsRaw = uni.informatics?.[0]?.institutions || [];
    
    // Some endpoints have 'travelreports' in the same informatics[0] block
    const travelreportsRaw = (uni.informatics?.[0] as Record<string, unknown>)?.travelreports || [];

    const relations: RawRelation[] = Array.isArray(relationsRaw) 
      ? relationsRaw 
      : Object.values(relationsRaw);
      
    const institutions: RawInstitution[] = Array.isArray(institutionsRaw)
      ? institutionsRaw
      : Object.values(institutionsRaw);

    const travelreports: unknown[] = Array.isArray(travelreportsRaw)
      ? travelreportsRaw
      : Object.values(travelreportsRaw);

    const details: Record<string, string> = {};
    relations.forEach((r: RawRelation) => {
      details[r.shortname] = r.fullname;
    });
    institutions.forEach((i: RawInstitution) => {
      // Don't overwrite relations if they have the same name, or maybe do?
      // Some things like "Attachments" are in institutions.
      // But we parse Attachments separately. Let's still add it to details unless it's Attachments.
      if (i.shortname !== 'Attachments') {
        details[i.shortname] = i.fullname;
      }
    });

    // Extract travel reports cleanly
    const parsedTravelReports = travelreports.map((trArray: unknown) => {
      const item = Array.isArray(trArray) ? trArray[0] : Object.values(trArray as object)[0];
      if (item && (item as Record<string, unknown>).fullname) {
        const fullname = (item as Record<string, unknown>).fullname as string;
        // Parse out data-id and title from anchor tag
        const match = fullname.match(/data-id=['"](\d+)['"].*>(.*?)</);
        if (match) {
          return {
            id: match[1],
            title: match[2].trim()
          };
        }
      }
      return null;
    }).filter(Boolean);

    // Also extract attachments (fact sheets, etc) from institutions block
    const parsedAttachments = institutions.filter(i => i.shortname === 'Attachments').flatMap(i => {
      const links = i.fullname.match(/<a.*?data-id=['"](\d+)['"].*?>(.*?)<\/a>/g) || [];
      return links.map(link => {
        const match = link.match(/data-id=['"](\d+)['"].*>(.*?)</);
        if (match) {
          return {
            id: match[1],
            title: match[2].trim()
          };
        }
        return null;
      }).filter(Boolean);
    });

    return NextResponse.json({
      ...uni,
      details,
      institutions,
      travelReports: parsedTravelReports,
      attachments: parsedAttachments
    });
  } catch (error) {
    console.error('Error fetching university details:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

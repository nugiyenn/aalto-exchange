import { NextResponse } from 'next/server';
import { RawUniversity, RawRelation, RawInstitution } from '../../../types/university';

export async function POST(request: Request) {
  try {
    const { coreId, relationIds } = await request.json();

    if (!coreId || !relationIds || !Array.isArray(relationIds) || relationIds.length === 0) {
      return NextResponse.json({ error: 'Missing IDs or relationIds array' }, { status: 400 });
    }

    // Fetch details for all relation IDs in parallel
    const fetchPromises = relationIds.map(async (relationId) => {
      const formData = new URLSearchParams();
      formData.append('action', 'load_report_data_on_ajax_load');
      formData.append('searched_data[publisher_id]', '11');
      formData.append('searched_data[core_id]', coreId.toString());
      formData.append('searched_data[relation_id]', relationId.toString());
      formData.append('ajaxload', '0');

      try {
        const res = await fetch('https://aalto.adv-pub.moveon4.de/ap-dashboard/admin-ajax.php', {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (!res.ok) {
          console.warn(`Failed to fetch details for relation ${relationId}: ${res.statusText}`);
          return null;
        }

        const textData = await res.text();
        const jsonMatch = textData.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return null;
        }
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.warn(`Error fetching relation ${relationId}:`, e);
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    const validResults = results.filter(Boolean);

    if (validResults.length === 0) {
      return NextResponse.json({ error: 'Not found or failed to fetch any relations' }, { status: 404 });
    }

    // Use the first successful result for the base university details (Overview tab)
    const baseData = validResults[0];
    const uni: RawUniversity = baseData?.labelvalue?.[0];
    
    if (!uni) {
      return NextResponse.json({ error: 'University data not found in response' }, { status: 404 });
    }

    // Parse base details
    const relationsRaw = uni.informatics?.[0]?.relations || [];
    const institutionsRaw = uni.informatics?.[0]?.institutions || [];
    
    const relations: RawRelation[] = Array.isArray(relationsRaw) 
      ? relationsRaw 
      : Object.values(relationsRaw);
      
    const institutions: RawInstitution[] = Array.isArray(institutionsRaw)
      ? institutionsRaw
      : Object.values(institutionsRaw);

    const details: Record<string, string> = {};
    relations.forEach((r: RawRelation) => {
      details[r.shortname] = r.fullname;
    });
    institutions.forEach((i: RawInstitution) => {
      if (i.shortname !== 'Attachments') {
        details[i.shortname] = i.fullname;
      }
    });

    // --- Combine Travel Reports & Attachments across ALL relations ---
    const allTravelReports = new Map<string, { id: string, title: string }>();
    const allAttachments = new Map<string, { id: string, title: string }>();

    validResults.forEach(data => {
      const currentUni = data?.labelvalue?.[0];
      if (!currentUni) return;

      const currentInformatics = currentUni.informatics?.[0] as Record<string, unknown> | undefined;
      if (!currentInformatics) return;

      // Extract travel reports
      const travelreportsRaw = currentInformatics.travelreports || [];
      const travelreports: unknown[] = Array.isArray(travelreportsRaw)
        ? travelreportsRaw
        : Object.values(travelreportsRaw);

      travelreports.forEach((trArray: unknown) => {
        const item = Array.isArray(trArray) ? trArray[0] : Object.values(trArray as object)[0];
        if (item && (item as Record<string, unknown>).fullname) {
          const fullname = (item as Record<string, unknown>).fullname as string;
          const match = fullname.match(/data-id=['"](\d+)['"].*>(.*?)</);
          if (match) {
            const id = match[1];
            const title = match[2].trim();
            if (!allTravelReports.has(id)) {
              allTravelReports.set(id, { id, title });
            }
          }
        }
      });

      // Extract attachments from institutions
      const currentInstitutionsRaw = currentInformatics.institutions || [];
      const currentInst: RawInstitution[] = Array.isArray(currentInstitutionsRaw)
        ? currentInstitutionsRaw
        : Object.values(currentInstitutionsRaw);

      currentInst.filter(i => i.shortname === 'Attachments').forEach(i => {
        const links = i.fullname.match(/<a.*?data-id=['"](\d+)['"].*?>(.*?)<\/a>/g) || [];
        links.forEach(link => {
          const match = link.match(/data-id=['"](\d+)['"].*>(.*?)</);
          if (match) {
            const id = match[1];
            const title = match[2].trim();
            if (!allAttachments.has(id)) {
              allAttachments.set(id, { id, title });
            }
          }
        });
      });
    });

    return NextResponse.json({
      ...uni,
      details,
      institutions,
      travelReports: Array.from(allTravelReports.values()),
      attachments: Array.from(allAttachments.values())
    });
  } catch (error) {
    console.error('Error fetching university details:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

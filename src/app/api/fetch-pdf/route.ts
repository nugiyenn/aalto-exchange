import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });
    }

    const formData = new URLSearchParams();
    formData.append('action', 'fetch_pdf_data');
    formData.append('fileId', fileId);

    const res = await fetch('https://aalto.adv-pub.moveon4.de/ap-dashboard/admin-ajax.php', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch PDF: ${res.statusText}`);
    }

    const blob = await res.blob();
    const buffer = await blob.arrayBuffer();
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="report-${fileId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 });
  }
}

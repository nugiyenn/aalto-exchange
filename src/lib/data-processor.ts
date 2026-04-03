import { University, RawUniversity, RawRelation } from '../types/university';
import rankings2026 from '../data/rankings2026.json';

const RANKINGS: Record<string, number> = rankings2026 as Record<string, number>;

export function parseInBrief(html: string): { gpaReq: string | null; languageReq: string | null; ectsReq: string | null } {
  if (!html) {
    return { gpaReq: null, languageReq: null, ectsReq: null };
  }

  // Simple Regex Extraction based on expected formats
  const gpaMatch = html.match(/([0-9]+\.[0-9]+\/[0-9]+\.[0-9]+|[0-9]+%|Min GPA)/i);
  const languageMatch = html.match(/(B[1-2]|C[1-2]|IELTS\s*[0-9.]+)/i);
  const ectsMatch = html.match(/([0-9]+)\s*ECTS/i);

  return {
    gpaReq: gpaMatch ? gpaMatch[1] : null,
    languageReq: languageMatch ? languageMatch[1] : null,
    ectsReq: ectsMatch ? ectsMatch[1] : null,
  };
}

export function enrichUniversityData(data: RawUniversity[]): University[] {
  return data.map((uni) => {
    // Find the 'In brief' relation text
    let inBriefHtml = '';
    let studyOpportunityHtml = '';
    
    if (uni.informatics && uni.informatics.length > 0) {
      // Need to handle when relations is an object instead of array (MoveON API quirk)
      let relations = uni.informatics[0].relations || [];
      if (!Array.isArray(relations)) {
        relations = Object.values(relations);
      }
      
      const inBriefRel = relations.find((r: RawRelation) => r.shortname === 'In brief');
      if (inBriefRel) {
        inBriefHtml = inBriefRel.fullname;
      }
      
      const studyOppRel = relations.find((r: RawRelation) => r.shortname === 'Study opportunity');
      if (studyOppRel) {
        studyOpportunityHtml = studyOppRel.fullname;
      }
    }

    // Strip HTML tags from study opportunity and clean up whitespace
    let studyOpportunity = null;
    if (studyOpportunityHtml) {
      studyOpportunity = studyOpportunityHtml.replace(/<[^>]*>?/gm, '').trim();
    }

    const { gpaReq, languageReq, ectsReq } = parseInBrief(inBriefHtml);

    // Match QS Rank (or fallback to 999)
    const qsRank = RANKINGS[uni.universityname] ?? 999;

    return {
      ...uni,
      qsRank,
      gpaReq,
      languageReq,
      ectsReq,
      studyOpportunity,
    };
  });
}

export interface RawInstitution {
  shortname: string;
  fullname: string;
}

export interface RawRelation {
  shortname: string;
  fullname: string;
}

export interface RawInformatics {
  relations?: RawRelation[];
  institutions?: RawInstitution[];
}

export interface RawUniversity {
  relation_id: string;
  core_id: string;
  country_id: string;
  country: string;
  country_fullname: string;
  logo: string;
  latitude: string;
  longitude: string;
  universityname: string;
  flagname: string;
  informatics?: RawInformatics[];
}

export interface University extends RawUniversity {
  qsRank: number;
  gpaReq: string | null;
  languageReq: string | null;
  ectsReq: string | null;
  studyOpportunity: string | null;
  variants?: { relation_id: string, studyOpportunity: string | null, gpaReq: string | null, languageReq: string | null, ectsReq: string | null }[];
}

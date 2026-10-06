export enum LegalDocumentId {
    TERMS = 'terms',
    PRIVACY = 'privacy',
    CONSENT = 'consent',
}

/** Абзац или маркированный список */
export type LegalBlock = string | { list: string[] };

export interface LegalSection {
    /** Якорь раздела в оглавлении */
    id: string;
    title: string;
    blocks: LegalBlock[];
}

export interface LegalDocument {
    title: string;
    /** Абзацы до первого раздела */
    intro: string[];
    sections: LegalSection[];
}

export type LegalDocuments = Record<LegalDocumentId, LegalDocument>;

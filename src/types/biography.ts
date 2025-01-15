export interface Section {
  id: string;
  title: string;
  content: string;
  created_at: string;
  last_edit: string;
  subsections: Record<string, Section>;
}

export interface Biography {
  id: string;
  title: string;
  content: string;
  created_at: string;
  last_edit: string;
  subsections: Record<string, Section>;
}

export interface BiographyEdit {
  type: 'RENAME' | 'ADD' | 'DELETE' | 'MOVE' | 'COMMENT';
  sectionId: string;
  title: string;
  data?: {
    newTitle?: string;
    parentTitle?: string;
    sectionPrompt?: string;
    comment?: {
      text: string;
      comment: string;
    };
  };
  timestamp: number;
} 
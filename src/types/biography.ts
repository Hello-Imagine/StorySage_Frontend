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
  type: 'RENAME' | 'ADD' | 'DELETE' | 'MOVE';
  sectionId: string;
  title: string;
  data?: {
    newTitle?: string;
    newPosition?: number;
    parentTitle?: string;
    contentSuggestion?: string;
  };
  timestamp: number;
} 
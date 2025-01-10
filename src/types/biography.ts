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
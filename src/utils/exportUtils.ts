import jsPDF from 'jspdf';
import { Biography, Section } from '../types/biography';

// Helper function to convert section to markdown
const sectionToMarkdown = (section: Section, level: number): string => {
  const heading = '#'.repeat(level);
  let markdown = `${heading} ${section.title}\n\n`;
  
  if (section.content) {
    markdown += `${section.content}\n\n`;
  }
  
  Object.values(section.subsections).forEach(subsection => {
    markdown += sectionToMarkdown(subsection, level + 1);
  });
  
  return markdown;
};

export const exportToPDF = (biography: Biography) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // PDF configuration
  const config = {
    margin: 20,
    lineHeight: 7,
    get maxWidth() {
      return doc.internal.pageSize.width - (this.margin * 2);
    },
    get maxY() {
      return doc.internal.pageSize.height - this.margin;
    }
  };

  // Content types and formatting
  interface ContentItem {
    text: string;
    fontSize: number;
    isTitle: boolean;
    level: number;
  }

  const formatConfig = {
    title: { fontSize: 20, spacing: 10 },
    content: { fontSize: 12, spacing: 5 },
    getSectionFontSize: (level: number) => Math.max(16 - (level * 2), 12)
  };

  // Collect content
  const contents: ContentItem[] = [
    // Main title
    { text: biography.title, fontSize: formatConfig.title.fontSize, isTitle: true, level: 1 }
  ];

  // Main content
  if (biography.content) {
    contents.push({
      text: biography.content,
      fontSize: formatConfig.content.fontSize,
      isTitle: false,
      level: 1
    });
  }

  // Collect sections recursively
  const collectSection = (section: Section, level: number) => {
    contents.push({
      text: section.title,
      fontSize: formatConfig.getSectionFontSize(level),
      isTitle: true,
      level
    });

    if (section.content) {
      contents.push({
        text: section.content,
        fontSize: formatConfig.content.fontSize,
        isTitle: false,
        level
      });
    }

    Object.values(section.subsections).forEach(subsection => {
      collectSection(subsection, level + 1);
    });
  };

  Object.values(biography.subsections).forEach(section => {
    collectSection(section, 2);
  });

  // Render content
  const renderContent = () => {
    let y = config.margin;

    contents.forEach((item) => {
      doc.setFontSize(item.fontSize);
      doc.setFont('times', item.isTitle ? 'bold' : 'normal');

      const lines = doc.splitTextToSize(item.text, config.maxWidth);
      const spacing = item.isTitle ? formatConfig.title.spacing : formatConfig.content.spacing;

      lines.forEach((line: string, index: number) => {
        if (y > config.maxY) {
          doc.addPage();
          y = config.margin;
        }

        doc.text(line, config.margin, y);
        y += config.lineHeight;

        if (index === lines.length - 1) {
          y += spacing;
        }
      });
    });
  };

  // Generate and save PDF
  renderContent();
  const filename = `${biography.title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};

export const exportToMarkdown = (biography: Biography) => {
  // Generate markdown content
  let markdown = `# ${biography.title}\n\n`;
  
  if (biography.content) {
    markdown += `${biography.content}\n\n`;
  }

  // Add sections
  Object.values(biography.subsections).forEach(section => {
    markdown += sectionToMarkdown(section, 2);
  });

  // Create and download file
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${biography.title.toLowerCase().replace(/\s+/g, '_')}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 
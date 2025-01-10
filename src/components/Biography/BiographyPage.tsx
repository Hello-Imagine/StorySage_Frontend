import React, { useState, useEffect } from 'react';
import { Typography, Spin, Button, message, Space, Tooltip } from 'antd';
import { FileMarkdownOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Biography, Section } from '../../types/biography';
// import { mockBiographyData } from '../../mocks/biographyData';
import jsPDF from 'jspdf';
import { apiClient } from '../../utils/api';

const { Title, Paragraph } = Typography;

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

const RenderSection: React.FC<{ section: Section; level: number }> = ({ section, level }) => {
  const titleLevel = Math.min(Math.max(level, 1), 5) as 1 | 2 | 3 | 4 | 5;
  
  return (
    <div className="mb-6">
      <Title level={titleLevel} className="text-blue-800 dark:text-blue-300">
        {section.title}
      </Title>
      {section.content && (
        <Paragraph className="text-gray-700 dark:text-gray-300 text-base whitespace-pre-line">
          {section.content}
        </Paragraph>
      )}
      {Object.values(section.subsections).map((subsection) => (
        <RenderSection
          key={subsection.id}
          section={subsection}
          level={level + 1}
        />
      ))}
    </div>
  );
};

const BiographyPage: React.FC = () => {
  const [biography, setBiography] = useState<Biography | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleExportPDF = () => {
    if (!biography) return;

    try {
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
      message.success('PDF exported successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Failed to export PDF');
    }
  };

  const handleExportMarkdown = () => {
    if (!biography) return;

    try {
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

      message.success('Markdown exported successfully');
    } catch (error) {
      console.error('Error generating Markdown:', error);
      message.error('Failed to export Markdown');
    }
  };

  useEffect(() => {
    const fetchBiography = async () => {
      try {
        setLoading(true);
        const data = await apiClient('BIOGRAPHY_LATEST', {
          method: 'GET',
        });
        setBiography(data);
        // setBiography(mockBiographyData); // Use mock data for testing
      } catch (error) {
        console.error('Error fetching biography:', error);
        setError(error instanceof Error ? error.message : 'Failed to load biography');
      } finally {
        setLoading(false);
      }
    };

    fetchBiography();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!biography) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">No biography found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-2">
          <Space>
            <Tooltip title="Export as PDF">
              <Button
                shape="circle"
                variant="dashed"
                icon={<FilePdfOutlined />}
                onClick={handleExportPDF}
                className="flex items-center justify-center"
              />
            </Tooltip>
            <Tooltip title="Export as Markdown">
              <Button
                shape="circle"
                variant="dashed"
                icon={<FileMarkdownOutlined />}
                onClick={handleExportMarkdown}
                className="flex items-center justify-center"
              />
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <Title className="text-center mb-8 text-blue-900 dark:text-blue-200">
          {biography!.title}
        </Title>
        {biography!.content && (
          <Paragraph className="text-gray-700 dark:text-gray-300 text-base whitespace-pre-line mb-8">
            {biography!.content}
          </Paragraph>
        )}
        {Object.values(biography!.subsections).map((section) => (
          <RenderSection key={section.id} section={section} level={2} />
        ))}
      </div>
    </div>
  );
};

export default BiographyPage;
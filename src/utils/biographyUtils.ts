import { BiographyEdit, Section } from '../types/biography';

export const addOrUpdateEdit = (prevEdits: BiographyEdit[], newEdit: BiographyEdit): BiographyEdit[] => {
  // For comments, we don't filter out previous edits
  if (newEdit.type === 'COMMENT') {
    return [...prevEdits, newEdit];
  }
  
  // For other edit types, filter out previous edits of the same type for the same section
  const filteredEdits = prevEdits.filter(edit => 
    !(edit.type === newEdit.type && edit.sectionId === newEdit.sectionId)
  );
  
  return [...filteredEdits, newEdit];
};

export const sortSectionsByNumber = (sections: Record<string, Section>): Record<string, Section> => {
  return Object.fromEntries(
    Object.entries(sections)
      .sort(([, a], [, b]) => {
        const aNum = a.title.split(' ')[0].split('.').map(Number);
        const bNum = b.title.split(' ')[0].split('.').map(Number);
        
        // Compare each level of the section numbers
        for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
          const aVal = aNum[i] || 0;
          const bVal = bNum[i] || 0;
          if (aVal !== bVal) return aVal - bVal;
        }
        return 0;
      })
  );
};

// Move findParentSection outside to be reused
export const findParentSection = (sections: Record<string, Section>, targetNumber: string): string | undefined => {
  const parentNumber = targetNumber.split('.').slice(0, -1).join('.');
  if (!parentNumber) return undefined;  // Top-level section

  for (const [name, section] of Object.entries(sections)) {
    const currentNumber = section.title.split(' ')[0];
    if (currentNumber === parentNumber) return name;
    
    const foundInSubsections = findParentSection(section.subsections, targetNumber);
    if (foundInSubsections) return foundInSubsections;
  }
  
  return undefined;
};

// Add these validation helper functions
export const isValidSubsectionNumber = (parentNumber: string, childNumber: string): boolean => {
  const parentParts = parentNumber.split('.');
  const childParts = childNumber.split('.');

  // Child should have exactly one more part than parent
  if (childParts.length !== parentParts.length + 1) {
    return false;
  }

  // All parts of child number should match parent except the last one
  for (let i = 0; i < parentParts.length; i++) {
    if (parentParts[i] !== childParts[i]) {
      return false;
    }
  }

  // Last part of child should be a number
  return !isNaN(Number(childParts[childParts.length - 1]));
};

export const isValidPathFormat = (sectionNumber: string): boolean => {
  if (!sectionNumber) {
    return true; // Empty path is valid (root)
  }

  const parts = sectionNumber.split('.');
  
  // Check maximum depth
  if (parts.length > 3) {
    return false;
  }
    
  // Validate first level requires single number prefix
  if (!parts[0] || !(/^\d+$/.test(parts[0]))) {
    return false;
  }
    
  // Validate second and third levels
  for (let i = 1; i < parts.length; i++) {
    const parentNumber = parts.slice(0, i).join('.');
    const currentNumber = parts.slice(0, i + 1).join('.');
    if (!isValidSubsectionNumber(parentNumber, currentNumber)) {
      return false;
    }
  }
    
  return true;
};
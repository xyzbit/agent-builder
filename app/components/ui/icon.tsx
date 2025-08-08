import * as LucideIcons from 'lucide-react';
import React from 'react';

export const safeLucideIcon = (iconName: string, className?: string) => {
  const IconComponent = (iconName in LucideIcons) ? LucideIcons[iconName] : LucideIcons.FileWarning;
  return React.createElement(IconComponent, { className });
};
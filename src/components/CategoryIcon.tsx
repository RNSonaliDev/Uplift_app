import React from 'react';
import { FileText, Pill, ShoppingBag } from 'lucide-react-native';

interface CategoryIconProps {
  title?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon = ({ title, size = 20, color }: CategoryIconProps) => {
  const t = title?.toLowerCase() || '';
  if (t.includes('pharmacy') || t.includes('medical') || t.includes('pill')) {
    return <Pill color={color} size={size} />;
  }
  if (t.includes('grocery') || t.includes('food')) {
    return <ShoppingBag color={color} size={size} />;
  }
  return <FileText color={color} size={size} />;
};

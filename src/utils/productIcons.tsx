import { 
  waterOutline, wineOutline, cubeOutline, bagHandleOutline 
} from 'ionicons/icons';

export const getProductIcon = (category: string, name: string) => {
  const lowerName = name.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';

  if (lowerName.includes('bottle') || lowerName.includes('pack')) {
    return wineOutline;
  }
  if (lowerCategory === 'bottled') {
    return wineOutline;
  }
  if (lowerCategory === 'packaged') {
    return bagHandleOutline;
  }
  if (lowerName.includes('round') || lowerName.includes('dispenser')) {
    return cubeOutline;
  }
  return waterOutline;
};

export const getProductBgColor = (category: string, name: string) => {
  const lowerName = name.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';

  if (lowerName.includes('bottle') || lowerName.includes('pack')) return '#fef3c7';
  if (lowerCategory === 'bottled') return '#fef3c7';
  if (lowerCategory === 'packaged') return '#fce7f3';
  return '#e0f2fe';
};

export const getProductIconColor = (category: string, name: string) => {
  const lowerName = name.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';

  if (lowerName.includes('bottle') || lowerName.includes('pack')) return '#f59e0b';
  if (lowerCategory === 'bottled') return '#f59e0b';
  if (lowerCategory === 'packaged') return '#ec4899';
  return '#0ea5e9';
};
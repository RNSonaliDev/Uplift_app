export const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  
  // If it contains dashes, let's parse it
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // If it looks like YYYY-MM-DD
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert to DD-MM-YYYY
      }
      // If it's already DD-MM-YYYY or similar, just return it
      return dateStr;
    }
  }

  // Fallback for other formats (e.g., full ISO strings)
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    // ignore
  }

  return dateStr;
};

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  
  // If it contains dashes, let's parse it
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // If it looks like YYYY-MM-DD
      if (parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // Convert to DD/MM/YYYY
      }
      // If it's already DD-MM-YYYY or similar, just replace dashes with slashes
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
  }

  // Fallback for other formats (e.g., full ISO strings)
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {
    // ignore
  }

  return dateStr;
};

export const formatTime12Hour = (timeStr?: string) => {
  if (!timeStr) return '';
  // expected format "HH:mm" or "HH:mm:ss"
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

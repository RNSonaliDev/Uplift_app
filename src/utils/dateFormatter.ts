export const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  
  // Try parsing as a Date object first (handles ISO strings gracefully)
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    }
  } catch (e) {
    // ignore
  }

  // Fallback for manual date parsing
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
      }
      return `${parts[1]}/${parts[0]}/${parts[2]}`;
    }
  }

  return dateStr;
};

export const formatTime12Hour = (timeStr?: string) => {
  if (!timeStr) return '';
  
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
    return timeStr;
  }
  
  // expected format "HH:mm" or "HH:mm:ss"
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].slice(0, 2);
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

export const formatDateTime = (dateObj: string | Date | number) => {
  if (!dateObj) return '';
  try {
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return '';
  }
};

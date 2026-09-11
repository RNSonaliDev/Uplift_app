import { Colors } from '../theme/colors';

export const formatStatus = (status: string) => {
  if (!status) return 'New';
  if (status.toLowerCase() === 'in_progress') return 'In Progress';
  if (status.toLowerCase() === 'on_the_way') return 'On the Way';
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

export const getStatusColors = (status: string) => {
  const s = status?.toLowerCase() || '';

  switch (s) {
    case 'completed':
      return { bg: Colors.secondary[50], text: Colors.secondary[700] }; // Green
    case 'confirmed':
      return { bg: '#F0FDFA', text: '#0F766E' }; // Teal
    case 'accepted':
      return { bg: '#F0F9FF', text: '#0369A1' }; // Sky Blue
    case 'in_progress':
      return { bg: Colors.primary[50], text: Colors.primary[700] }; // Purple (Brand)
    case 'assigned':
      return { bg: '#EEF2FF', text: '#4338CA' }; // Indigo
    case 'on_the_way':
      return { bg: '#FDF2F8', text: '#BE185D' }; // Pink
    case 'cancelled':
      return { bg: '#FEF2F2', text: Colors.error }; // Red
    case 'rejected':
      return { bg: '#FFF1F2', text: '#BE123C' }; // Rose
    case 'pending':
      return { bg: Colors.accent[50], text: Colors.accent[700] }; // Orange (Brand)
    case 'new':
      return { bg: '#EFF6FF', text: '#1D4ED8' }; // Blue
    case 'open':
      return { bg: '#ECFEFF', text: '#0E7490' }; // Cyan
    case 'published':
      return { bg: '#F0FDF4', text: '#16A34A' }; // Green
    case 'draft':
      return { bg: Colors.primary[50], text: Colors.primary[600] }; // Purple
    case 'closed':
      return { bg: '#FEF2F2', text: '#DC2626' }; // Red
    case 'resolved':
      return { bg: Colors.secondary[50], text: Colors.secondary[700] }; // Green
    default:
      return { bg: Colors.neutral[100], text: Colors.neutral[700] }; // Gray fallback
  }
};

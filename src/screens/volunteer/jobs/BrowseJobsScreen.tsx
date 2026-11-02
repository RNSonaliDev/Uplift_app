import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, TextInput, Modal, FlatList } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';
import { FontFamily } from '../../../theme/typography';
import { AppText } from '../../../components/AppText';
import { Briefcase, Search, Link2, ChevronDown, X, SlidersHorizontal, Check } from 'lucide-react-native';
import { api } from '../../../api/client';

const ORDER_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Title A-Z', value: 'title_asc' },
  { label: 'Title Z-A', value: 'title_desc' },
  { label: 'Most Viewed', value: 'most_viewed' },
  { label: 'Recently Published', value: 'recently_published' },
];

const DEFAULT_DEPARTMENTS = [
  { id: 1, title: 'Administration' },
  { id: 2, title: 'Creative & Design' },
  { id: 3, title: 'Customer Service' },
  { id: 4, title: 'Education & Tutoring' },
];

const JOB_TYPES = [
  { id: 'Full-Time', title: 'Full-Time' },
  { id: 'Part-Time', title: 'Part-Time' },
  { id: 'Internship', title: 'Internship' },
  { id: 'Temporary', title: 'Temporary' },
];

const WORK_SETTINGS = [
  { id: 'Onsite', title: 'Onsite' },
  { id: 'Remote', title: 'Remote' },
  { id: 'Hybrid', title: 'Hybrid' },
];

const COMPENSATIONS = [
  { id: 'Paid - Hourly', title: 'Paid - Hourly' },
  { id: 'Paid - Salary', title: 'Paid - Salary' },
  { id: 'Unpaid', title: 'Unpaid' },
];

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  selectedCountBadge: {
    backgroundColor: Colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[500],
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    backgroundColor: Colors.neutral[50],
  },
  modalFooterClearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalFooterApplyBtn: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

interface MultiSelectModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  selectedIds: (string | number)[];
  onApply: (selected: (string | number)[]) => void;
  keyField?: string;
  labelField?: string;
}

const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  visible,
  onClose,
  title,
  data,
  selectedIds,
  onApply,
  keyField = 'id',
  labelField = 'title',
}) => {
  const [tempSelected, setTempSelected] = useState<(string | number)[]>(selectedIds);

  useEffect(() => {
    if (visible) {
      setTempSelected(selectedIds);
    }
  }, [visible, selectedIds]);

  const toggleItem = (id: string | number) => {
    setTempSelected(prev => {
      const exists = prev.some(item => String(item) === String(id));
      if (exists) {
        return prev.filter(item => String(item) !== String(id));
      } else {
        return [...prev, id];
      }
    });
  };

  const handleApply = () => {
    onApply(tempSelected);
    onClose();
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={modalStyles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AppText variant="h6" color={Colors.neutral[900]}>{title}</AppText>
              {tempSelected.length > 0 && (
                <View style={modalStyles.selectedCountBadge}>
                  <AppText variant="labelSmall" color={Colors.primary[600]} style={{ fontFamily: FontFamily.semiBold }}>
                    {tempSelected.length}
                  </AppText>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X color={Colors.neutral[600]} size={24} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={item => String(item[keyField] ?? item.id ?? item.title)}
            renderItem={({ item }) => {
              const itemId = item[keyField] ?? item.id ?? item.title;
              const isChecked = tempSelected.some(sel => String(sel) === String(itemId));
              const label = item[labelField] || item.title || item.name || String(itemId || '');
              return (
                <TouchableOpacity
                  style={[modalStyles.modalOptionRow, isChecked && { backgroundColor: Colors.primary[50] + '40' }]}
                  onPress={() => toggleItem(itemId)}
                  activeOpacity={0.7}
                >
                  <AppText
                    variant="bodyMedium"
                    color={isChecked ? Colors.primary[700] : Colors.neutral[700]}
                    style={isChecked ? { fontFamily: FontFamily.semiBold } : undefined}
                  >
                    {label}
                  </AppText>
                  <View style={[modalStyles.checkbox, isChecked && modalStyles.checkboxSelected]}>
                    {isChecked && <Check color="#fff" size={13} strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            }}
            style={{ maxHeight: 340 }}
          />
          <View style={modalStyles.modalFooter}>
            <TouchableOpacity
              style={modalStyles.modalFooterClearBtn}
              onPress={handleClear}
              disabled={tempSelected.length === 0}
            >
              <AppText
                variant="labelMedium"
                color={tempSelected.length > 0 ? Colors.neutral[600] : Colors.neutral[300]}
              >
                Clear All
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={modalStyles.modalFooterApplyBtn}
              onPress={handleApply}
            >
              <AppText
                variant="labelMedium"
                color="#FFF"
                style={{ fontFamily: FontFamily.semiBold }}
              >
                Apply{tempSelected.length > 0 ? ` (${tempSelected.length})` : ''}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const BrowseJobsScreen = () => {
  const navigation = useNavigation<any>();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-select Filter states
  const [selectedDepartments, setSelectedDepartments] = useState<(string | number)[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedWorkSettings, setSelectedWorkSettings] = useState<string[]>([]);
  const [selectedCompensations, setSelectedCompensations] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState('newest');

  // Modal visibility
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [jobTypeModalVisible, setJobTypeModalVisible] = useState(false);
  const [workSettingModalVisible, setWorkSettingModalVisible] = useState(false);
  const [compensationModalVisible, setCompensationModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);

  const [departments, setDepartments] = useState<any[]>(DEFAULT_DEPARTMENTS);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await api.get<any>('/job_categories');
        const list = Array.isArray(data) ? data : (data?.job_categories || data?.categories || []);
        if (list && list.length > 0) {
          setDepartments(list);
        }
      } catch (error) {
        console.error('Failed to fetch departments', error);
      }
    };
    fetchDepartments();
  }, []);

  const selectedOrderLabel = ORDER_OPTIONS.find(o => o.value === orderBy)?.label || 'Newest';

  const isFirstMount = React.useRef(true);

  const fetchJobs = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      let url = '/job_posts/browse';
      const params: string[] = [];
      if (searchQuery.trim()) {
        params.push(`title=${encodeURIComponent(searchQuery.trim())}`);
      }
      if (selectedDepartments.length > 0) {
        if (selectedDepartments.length === 1) {
          params.push(`department_id=${encodeURIComponent(selectedDepartments[0])}`);
        } else {
          selectedDepartments.forEach(id => {
            params.push(`department_id[]=${encodeURIComponent(id)}`);
          });
          params.push(`department_ids=${encodeURIComponent(selectedDepartments.join(','))}`);
        }
      }
      if (selectedJobTypes.length > 0) {
        if (selectedJobTypes.length === 1) {
          params.push(`job_type=${encodeURIComponent(selectedJobTypes[0])}`);
        } else {
          selectedJobTypes.forEach(jt => {
            params.push(`job_type[]=${encodeURIComponent(jt)}`);
          });
          params.push(`job_types=${encodeURIComponent(selectedJobTypes.join(','))}`);
        }
      }
      if (selectedWorkSettings.length > 0) {
        if (selectedWorkSettings.length === 1) {
          params.push(`work_setting=${encodeURIComponent(selectedWorkSettings[0])}`);
        } else {
          selectedWorkSettings.forEach(ws => {
            params.push(`work_setting[]=${encodeURIComponent(ws)}`);
          });
          params.push(`work_settings=${encodeURIComponent(selectedWorkSettings.join(','))}`);
        }
      }
      if (selectedCompensations.length > 0) {
        if (selectedCompensations.length === 1) {
          params.push(`compensation=${encodeURIComponent(selectedCompensations[0])}`);
        } else {
          selectedCompensations.forEach(c => {
            params.push(`compensation[]=${encodeURIComponent(c)}`);
          });
          params.push(`compensations=${encodeURIComponent(selectedCompensations.join(','))}`);
        }
      }
      if (orderBy) {
        params.push(`order_by=${orderBy}`);
      }
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      const data = await api.get<any>(url);
      let list = Array.isArray(data) ? data : (data?.job_posts || data?.jobs || []);

      // Client-side filtering ensures accurate results
      if (selectedDepartments.length > 0) {
        list = list.filter((job: any) => {
          const deptId = typeof job.department === 'object' && job.department !== null 
            ? job.department.id 
            : (job.department_id || job.department);
          const deptTitle = typeof job.department === 'object' && job.department !== null 
            ? (job.department.title || job.department.name) 
            : job.department;
          return selectedDepartments.some(sel => 
            String(sel) === String(deptId) || 
            (deptTitle && String(sel).toLowerCase() === String(deptTitle).toLowerCase())
          );
        });
      }

      if (selectedJobTypes.length > 0) {
        list = list.filter((job: any) => 
          job.job_type && selectedJobTypes.some(jt => jt.toLowerCase() === String(job.job_type).toLowerCase())
        );
      }

      if (selectedWorkSettings.length > 0) {
        list = list.filter((job: any) => 
          job.work_setting && selectedWorkSettings.some(ws => ws.toLowerCase() === String(job.work_setting).toLowerCase())
        );
      }

      if (selectedCompensations.length > 0) {
        list = list.filter((job: any) => 
          job.compensation && selectedCompensations.some(c => c.toLowerCase() === String(job.compensation).toLowerCase())
        );
      }

      setJobs(list);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDepartments, selectedJobTypes, selectedWorkSettings, selectedCompensations, orderBy]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        fetchJobs(true);
        isFirstMount.current = false;
      } else {
        fetchJobs(false);
      }
    }, [fetchJobs])
  );

  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedJobTypes([]);
    setSelectedWorkSettings([]);
    setSelectedCompensations([]);
    setOrderBy('newest');
  };

  const hasActiveFilters = 
    selectedDepartments.length > 0 || 
    selectedJobTypes.length > 0 || 
    selectedWorkSettings.length > 0 || 
    selectedCompensations.length > 0 || 
    orderBy !== 'newest';

  const getDepartmentChipLabel = () => {
    if (selectedDepartments.length === 0) return 'Department';
    if (selectedDepartments.length === 1) {
      const d = departments.find(item => String(item.id) === String(selectedDepartments[0]) || item.title === selectedDepartments[0]);
      return d?.title || d?.name || 'Department (1)';
    }
    return `Department (${selectedDepartments.length})`;
  };

  const getJobTypeChipLabel = () => {
    if (selectedJobTypes.length === 0) return 'Job Type';
    if (selectedJobTypes.length === 1) return selectedJobTypes[0];
    return `Job Type (${selectedJobTypes.length})`;
  };

  const getWorkSettingChipLabel = () => {
    if (selectedWorkSettings.length === 0) return 'Work Setting';
    if (selectedWorkSettings.length === 1) return selectedWorkSettings[0];
    return `Work Setting (${selectedWorkSettings.length})`;
  };

  const getCompensationChipLabel = () => {
    if (selectedCompensations.length === 0) return 'Compensation';
    if (selectedCompensations.length === 1) return selectedCompensations[0];
    return `Compensation (${selectedCompensations.length})`;
  };

  const renderJobCard = (job: any) => (
    <TouchableOpacity
      key={job.id}
      style={styles.card}
      onPress={() => navigation.navigate('VolunteerJobDetails', { job })}
      activeOpacity={0.7}
    >
      {(job.badge || job.department || job.job_type) && (
        <View style={styles.badgeRow}>
          {job.badge && (
            <View style={[styles.categoryBadge, { backgroundColor: Colors.primary[100], borderColor: Colors.primary[300] }]}>
              <AppText variant="labelSmall" color={Colors.primary[700]} style={{ fontFamily: FontFamily.bold }}>
                ★ {job.badge}
              </AppText>
            </View>
          )}
          {job.department && (
            <View style={styles.categoryBadge}>
              <AppText variant="labelSmall" color={Colors.primary[700]}>
                {typeof job.department === 'object' && job.department !== null ? job.department.title : job.department}
              </AppText>
            </View>
          )}
          {job.job_type && (
            <View style={styles.subCategoryBadge}>
              <AppText variant="labelSmall" color={Colors.neutral[600]}>
                {job.job_type}
              </AppText>
            </View>
          )}
        </View>
      )}

      {job.company_name ? (
        <AppText variant="bodyLarge" weight="bold" color={Colors.neutral[900]} numberOfLines={1} style={styles.companyName}>
          {job.company_name}
        </AppText>
      ) : null}

      <AppText
        variant={job.company_name ? 'bodyMedium' : 'bodyLarge'}
        weight={job.company_name ? 'medium' : 'semiBold'}
        color={job.company_name ? Colors.neutral[700] : Colors.neutral[900]}
        numberOfLines={1}
        style={styles.jobTitle}
      >
        {job.title}
      </AppText>

      {job.company_url ? (
        <View style={styles.urlRow}>
          <Link2 color={Colors.neutral[500]} size={14} />
          <AppText variant="caption" color={Colors.neutral[700]} style={{marginLeft: 8, flex: 1}} numberOfLines={1}>
            {job.company_url}
          </AppText>
        </View>
      ) : null}

      {job.description ? (
        <AppText variant="caption" color={Colors.neutral[700]} numberOfLines={2} style={{marginTop: 6, lineHeight: 18}}>
          {job.description}
        </AppText>
      ) : null}
    </TouchableOpacity>
  );

  const renderSingleSelectModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    data: any[],
    selectedId: string | null,
    onSelect: (item: any) => void,
    keyField = 'id',
    labelField = 'title'
  ) => (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={modalStyles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={modalStyles.modalContent}>
          <View style={modalStyles.modalHeader}>
            <AppText variant="h6" color={Colors.neutral[900]}>{title}</AppText>
            <TouchableOpacity onPress={onClose} hitSlop={{top:10,bottom:10,left:10,right:10}}>
              <X color={Colors.neutral[600]} size={24} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={item => String(item[keyField])}
            renderItem={({ item }) => {
              const isSelected = selectedId === item[keyField];
              return (
                <TouchableOpacity
                  style={[modalStyles.modalOptionRow, isSelected && { backgroundColor: Colors.primary[50] + '40' }]}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                >
                  <AppText
                    variant="bodyMedium"
                    color={isSelected ? Colors.primary[600] : Colors.neutral[700]}
                    style={isSelected ? { fontFamily: FontFamily.semiBold } : undefined}
                  >
                    {item[labelField]}
                  </AppText>
                  {isSelected && <Check color={Colors.primary[600]} size={16} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            }}
            style={{ maxHeight: 320 }}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <AppText variant="h5" color={Colors.neutral[0]} style={{textAlign: 'center'}}>Browse Jobs</AppText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color={Colors.neutral[400]} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs..."
              placeholderTextColor={Colors.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => fetchJobs(true)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); fetchJobs(true); }} style={{ padding: 4, marginRight: 4 }}>
                <X color={Colors.neutral[400]} size={16} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => setDepartmentModalVisible(true)} 
              style={styles.filterIconBtn}
              activeOpacity={0.7}
            >
              <SlidersHorizontal color={hasActiveFilters ? Colors.primary[600] : Colors.neutral[400]} size={20} />
              {hasActiveFilters && <View style={styles.filterDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters Row - Always visible directly below search */}
        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {/* Department Filter (Multi-select) */}
            <TouchableOpacity 
              style={[styles.filterChip, selectedDepartments.length > 0 && styles.filterChipActive]} 
              onPress={() => setDepartmentModalVisible(true)}
              activeOpacity={0.7}
            >
              <AppText 
                variant="labelSmall" 
                color={selectedDepartments.length > 0 ? Colors.primary[600] : Colors.neutral[700]}
                style={selectedDepartments.length > 0 ? { fontFamily: FontFamily.semiBold } : undefined}
              >
                {getDepartmentChipLabel()}
              </AppText>
              <ChevronDown color={selectedDepartments.length > 0 ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{marginLeft: 4}} />
            </TouchableOpacity>

            {/* Job Type Filter (Multi-select) */}
            <TouchableOpacity 
              style={[styles.filterChip, selectedJobTypes.length > 0 && styles.filterChipActive]} 
              onPress={() => setJobTypeModalVisible(true)}
              activeOpacity={0.7}
            >
              <AppText 
                variant="labelSmall" 
                color={selectedJobTypes.length > 0 ? Colors.primary[600] : Colors.neutral[700]}
                style={selectedJobTypes.length > 0 ? { fontFamily: FontFamily.semiBold } : undefined}
              >
                {getJobTypeChipLabel()}
              </AppText>
              <ChevronDown color={selectedJobTypes.length > 0 ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{marginLeft: 4}} />
            </TouchableOpacity>

            {/* Work Setting Filter (Multi-select) */}
            <TouchableOpacity 
              style={[styles.filterChip, selectedWorkSettings.length > 0 && styles.filterChipActive]} 
              onPress={() => setWorkSettingModalVisible(true)}
              activeOpacity={0.7}
            >
              <AppText 
                variant="labelSmall" 
                color={selectedWorkSettings.length > 0 ? Colors.primary[600] : Colors.neutral[700]}
                style={selectedWorkSettings.length > 0 ? { fontFamily: FontFamily.semiBold } : undefined}
              >
                {getWorkSettingChipLabel()}
              </AppText>
              <ChevronDown color={selectedWorkSettings.length > 0 ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{marginLeft: 4}} />
            </TouchableOpacity>

            {/* Compensation Filter (Multi-select) */}
            <TouchableOpacity 
              style={[styles.filterChip, selectedCompensations.length > 0 && styles.filterChipActive]} 
              onPress={() => setCompensationModalVisible(true)}
              activeOpacity={0.7}
            >
              <AppText 
                variant="labelSmall" 
                color={selectedCompensations.length > 0 ? Colors.primary[600] : Colors.neutral[700]}
                style={selectedCompensations.length > 0 ? { fontFamily: FontFamily.semiBold } : undefined}
              >
                {getCompensationChipLabel()}
              </AppText>
              <ChevronDown color={selectedCompensations.length > 0 ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{marginLeft: 4}} />
            </TouchableOpacity>

            {/* Order By Filter */}
            <TouchableOpacity 
              style={[styles.filterChip, orderBy !== 'newest' && styles.filterChipActive]} 
              onPress={() => setOrderModalVisible(true)}
              activeOpacity={0.7}
            >
              <AppText 
                variant="labelSmall" 
                color={orderBy !== 'newest' ? Colors.primary[600] : Colors.neutral[700]}
                style={orderBy !== 'newest' ? { fontFamily: FontFamily.semiBold } : undefined}
              >
                {selectedOrderLabel}
              </AppText>
              <ChevronDown color={orderBy !== 'newest' ? Colors.primary[600] : Colors.neutral[400]} size={14} style={{marginLeft: 4}} />
            </TouchableOpacity>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearChip} onPress={clearFilters} activeOpacity={0.7}>
                <X color={Colors.error} size={14} />
                <AppText variant="labelSmall" color={Colors.error} style={{marginLeft: 4, fontFamily: FontFamily.medium}}>Clear</AppText>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Active Selected Filter Badges / Pills */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
              {selectedDepartments.map(id => {
                const item = departments.find(d => String(d.id) === String(id) || d.title === id);
                const label = item?.title || item?.name || String(id);
                return (
                  <TouchableOpacity 
                    key={`dept-${id}`} 
                    style={styles.activeFilterPill}
                    onPress={() => setSelectedDepartments(prev => prev.filter(x => String(x) !== String(id)))}
                    activeOpacity={0.7}
                  >
                    <AppText variant="caption" color={Colors.primary[700]} style={{ fontFamily: FontFamily.medium }}>
                      {label}
                    </AppText>
                    <X color={Colors.primary[700]} size={12} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                );
              })}
              {selectedJobTypes.map(jt => (
                <TouchableOpacity 
                  key={`jt-${jt}`} 
                  style={styles.activeFilterPill}
                  onPress={() => setSelectedJobTypes(prev => prev.filter(x => x !== jt))}
                  activeOpacity={0.7}
                >
                  <AppText variant="caption" color={Colors.primary[700]} style={{ fontFamily: FontFamily.medium }}>
                    {jt}
                  </AppText>
                  <X color={Colors.primary[700]} size={12} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
              {selectedWorkSettings.map(ws => (
                <TouchableOpacity 
                  key={`ws-${ws}`} 
                  style={styles.activeFilterPill}
                  onPress={() => setSelectedWorkSettings(prev => prev.filter(x => x !== ws))}
                  activeOpacity={0.7}
                >
                  <AppText variant="caption" color={Colors.primary[700]} style={{ fontFamily: FontFamily.medium }}>
                    {ws}
                  </AppText>
                  <X color={Colors.primary[700]} size={12} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
              {selectedCompensations.map(c => (
                <TouchableOpacity 
                  key={`c-${c}`} 
                  style={styles.activeFilterPill}
                  onPress={() => setSelectedCompensations(prev => prev.filter(x => x !== c))}
                  activeOpacity={0.7}
                >
                  <AppText variant="caption" color={Colors.primary[700]} style={{ fontFamily: FontFamily.medium }}>
                    {c}
                  </AppText>
                  <X color={Colors.primary[700]} size={12} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={fetchJobs} />}
        >
          {jobs.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Briefcase color={Colors.neutral[300]} size={48} />
              <AppText variant="bodyMedium" color={Colors.neutral[500]} style={{marginTop: 16}}>
                No jobs found.
              </AppText>
              <AppText variant="bodySmall" color={Colors.neutral[400]} style={{marginTop: 4}}>
                Try adjusting your search or filters.
              </AppText>
            </View>
          ) : (
            jobs.map(job => renderJobCard(job))
          )}
        </ScrollView>

        {/* Department Modal (Multi-select) */}
        <MultiSelectModal
          visible={departmentModalVisible}
          onClose={() => setDepartmentModalVisible(false)}
          title="Select Department"
          data={departments}
          selectedIds={selectedDepartments}
          onApply={(selected) => setSelectedDepartments(selected)}
        />

        {/* Job Type Modal (Multi-select) */}
        <MultiSelectModal
          visible={jobTypeModalVisible}
          onClose={() => setJobTypeModalVisible(false)}
          title="Select Job Type"
          data={JOB_TYPES}
          selectedIds={selectedJobTypes}
          onApply={(selected) => setSelectedJobTypes(selected as string[])}
        />

        {/* Work Setting Modal (Multi-select) */}
        <MultiSelectModal
          visible={workSettingModalVisible}
          onClose={() => setWorkSettingModalVisible(false)}
          title="Select Work Setting"
          data={WORK_SETTINGS}
          selectedIds={selectedWorkSettings}
          onApply={(selected) => setSelectedWorkSettings(selected as string[])}
        />

        {/* Compensation Modal (Multi-select) */}
        <MultiSelectModal
          visible={compensationModalVisible}
          onClose={() => setCompensationModalVisible(false)}
          title="Select Compensation"
          data={COMPENSATIONS}
          selectedIds={selectedCompensations}
          onApply={(selected) => setSelectedCompensations(selected as string[])}
        />

        {/* Order By Modal (Single-select) */}
        {renderSingleSelectModal(
          orderModalVisible,
          () => setOrderModalVisible(false),
          'Sort By',
          ORDER_OPTIONS.map(o => ({ id: o.value, title: o.label })),
          orderBy,
          (item) => {
            setOrderBy(item.id);
            setOrderModalVisible(false);
          }
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.neutral[50] },
  header: {
    backgroundColor: Colors.primary[500],
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Colors.neutral[900],
    padding: 0,
  },
  filterIconBtn: {
    padding: 4,
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[600],
  },
  filtersRow: {
    backgroundColor: '#FFF',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterChipActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[400],
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  activeFiltersRow: {
    backgroundColor: '#FFF',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  activeFiltersScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  content: { padding: 16 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[100],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  companyName: {
    marginBottom: 2,
  },
  jobTitle: {
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  subCategoryBadge: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { X, Check, Globe } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography, FontFamily } from '../theme/typography';
import { AppText } from './AppText';
import { TimeZone } from '../api/timeZones';

interface TimeZonePickerModalProps {
  visible: boolean;
  onClose: () => void;
  timeZones: TimeZone[];
  selectedTimeZone: TimeZone | null;
  onSelect: (timeZone: TimeZone) => void;
  detectedZipCode?: string | null;
}

export const TimeZonePickerModal: React.FC<TimeZonePickerModalProps> = ({
  visible,
  onClose,
  timeZones,
  selectedTimeZone,
  onSelect,
  detectedZipCode,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.iconContainer}>
                <Globe size={18} color={Colors.primary[600]} />
              </View>
              <View>
                <AppText variant="h5" color={Colors.neutral[900]} style={{ fontFamily: FontFamily.semiBold }}>
                  Select Time Zone
                </AppText>
                {detectedZipCode ? (
                  <AppText variant="caption" color={Colors.primary[600]} style={{ marginTop: 2 }}>
                    Auto-detected for ZIP: {detectedZipCode}
                  </AppText>
                ) : null}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={22} color={Colors.neutral[500]} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={true} bounces={false}>
            {timeZones.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="small" color={Colors.primary[600]} />
                <AppText variant="caption" color={Colors.neutral[500]} style={{ marginTop: 8 }}>
                  Loading time zones...
                </AppText>
              </View>
            ) : (
              timeZones.map((tz) => {
                const isSelected = selectedTimeZone?.id === tz.id || selectedTimeZone?.code === tz.code;
                return (
                  <TouchableOpacity
                    key={tz.id || tz.code}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelect(tz);
                      onClose();
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {tz.label || `${tz.code} — ${tz.name}`}
                      </Text>
                      <Text style={styles.optionSubtitle}>
                        {tz.current_abbreviation ? `${tz.current_abbreviation} · ` : ''}
                        {tz.utc_offset_label || ''}
                        {tz.iana_name ? ` (${tz.iana_name.replace('_', ' ')})` : ''}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkContainer}>
                        <Check size={18} color={Colors.primary[600]} strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    paddingVertical: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  optionRowSelected: {
    backgroundColor: Colors.primary[50] + '40',
  },
  optionLabel: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    fontFamily: FontFamily.medium,
  },
  optionLabelSelected: {
    color: Colors.primary[600],
    fontFamily: FontFamily.semiBold,
  },
  optionSubtitle: {
    ...Typography.caption,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  checkContainer: {
    marginLeft: 12,
  },
});


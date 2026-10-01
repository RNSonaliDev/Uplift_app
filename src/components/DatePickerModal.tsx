import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { AppText } from './AppText';
import { Colors } from '../theme/colors';

interface DatePickerModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Current date value */
  date: Date;
  /** Picker mode */
  mode?: 'date' | 'time' | 'datetime';
  /** Minimum selectable date */
  minimumDate?: Date;
  /** Maximum selectable date */
  maximumDate?: Date;
  /** Called when user confirms a date */
  onConfirm: (date: Date) => void;
  /** Called when user cancels */
  onCancel: () => void;
}

/**
 * Drop-in replacement for react-native-date-picker's modal mode,
 * using @react-native-community/datetimepicker which is compatible
 * with iOS 27 / Xcode 17.
 */
export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  open,
  date,
  mode = 'date',
  minimumDate,
  maximumDate,
  onConfirm,
  onCancel,
}) => {
  const [tempDate, setTempDate] = useState<Date>(date);

  useEffect(() => {
    if (open) {
      setTempDate(date);
    }
  }, [open, date]);

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      // Android fires onChange immediately as confirm/cancel
      if (_event.type === 'dismissed') {
        onCancel();
      } else if (selectedDate) {
        onConfirm(selectedDate);
      }
    } else {
      // iOS: just update the temporary date
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  // On Android, render the picker directly (it shows as a native dialog)
  if (Platform.OS === 'android') {
    if (!open) return null;
    return (
      <DateTimePicker
        value={tempDate}
        mode={mode === 'datetime' ? 'date' : mode}
        display="default"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onChange={handleChange}
      />
    );
  }

  // On iOS, wrap in a Modal with Cancel/Done buttons
  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onCancel} activeOpacity={1} />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
              <AppText variant="bodyMedium" color={Colors.primary[500]}>
                Cancel
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onConfirm(tempDate)}
              style={styles.headerButton}
            >
              <AppText variant="bodyMedium" color={Colors.primary[500]} weight="bold">
                Done
              </AppText>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode={mode === 'datetime' ? 'date' : mode}
            display="spinner"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
            style={styles.picker}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.neutral[200],
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  picker: {
    height: 216,
  },
});

export default DatePickerModal;

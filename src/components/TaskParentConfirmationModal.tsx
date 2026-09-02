import React, {useState} from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import {Popup} from './Popup';
import {AppText} from './AppText';
import {Button} from './Button';
import {Colors} from '../theme/colors';
import {verticalScale, horizontalScale} from '../utils/responsive';
import Toast from 'react-native-toast-message';

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const TaskParentConfirmationModal: React.FC<Props> = ({visible, onClose, onConfirm}) => {
  return (
    <Popup 
      visible={visible} 
      type="info"
      title="Parent Approval Required"
      message="This task requires approval from a parent or guardian before you can accept it."
      onClose={() => {
        onClose();
        onConfirm();
      }} 
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: horizontalScale(16),
  },
  otpInput: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: verticalScale(12),
    width: '100%',
  }
});

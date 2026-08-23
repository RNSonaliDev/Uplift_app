import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ArrowLeft, ShieldCheck} from 'lucide-react-native';
import {AppText} from '../../../components/AppText';
import {Button} from '../../../components/Button';
import {Colors} from '../../../theme/colors';
import {api} from '../../../api/client';
import {
  horizontalScale,
  verticalScale,
  moderateScale,
} from '../../../utils/responsive';

export default function StartRequestScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const request = route.params?.request || {};
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartTask = async () => {
    if (code.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit start code.');
      return;
    }

    if (!request.id) {
      Alert.alert('Error', 'Missing request ID.');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/help_requests/${request.id}/start`, {
        start_code: code
      });
      Alert.alert('Success', 'Task started successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to start request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
        <AppText variant="h4" color={Colors.neutral[900]} style={styles.headerTitle}>
          Start Request
        </AppText>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ShieldCheck color={Colors.primary[500]} size={48} />
        </View>

        <AppText variant="h3" color={Colors.neutral[900]} style={styles.title} center>
          Enter Start Code
        </AppText>
        
        <AppText variant="bodyLarge" color={Colors.neutral[600]} style={styles.subtitle} center>
          Please enter the 6-digit start code provided by the beneficiary to begin this request.
        </AppText>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
            keyboardType="number-pad"
            placeholder="000000"
            placeholderTextColor={Colors.neutral[300]}
            maxLength={6}
          />
        </View>

        <Button 
          title="Start Task" 
          onPress={handleStartTask}
          loading={loading}
          disabled={code.length !== 6 || loading}
          fullWidth 
          style={styles.startBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  iconButton: {
    padding: moderateScale(8),
  },
  iconButtonPlaceholder: {
    width: moderateScale(40),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: horizontalScale(24),
    alignItems: 'center',
    paddingTop: verticalScale(40),
  },
  iconContainer: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  title: {
    marginBottom: verticalScale(12),
  },
  subtitle: {
    marginBottom: verticalScale(40),
    lineHeight: 24,
    paddingHorizontal: horizontalScale(16),
  },
  inputContainer: {
    width: '100%',
    marginBottom: verticalScale(40),
  },
  input: {
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 8,
    paddingVertical: verticalScale(16),
  },
  startBtn: {
    marginTop: 'auto',
    marginBottom: verticalScale(32),
  },
});

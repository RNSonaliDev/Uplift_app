import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Phone, Trash2, User } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Spacing, BorderRadius } from '../../../theme/spacing';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

export default function EmergencyContactsScreen() {
  const navigation = useNavigation<any>();
  
  // Mock data for initial state
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Jane Doe', relationship: 'Mother', phone: '+1234567890' },
  ]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '' });

  const updateContact = (id: string, field: keyof EmergencyContact, value: string) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSave = () => {
    if (!form.name || !form.phone || !form.relationship) return;

    setContacts([...contacts, { id: Date.now().toString(), ...form }]);
    
    setIsAdding(false);
    setForm({ name: '', relationship: '', phone: '' });
  };

  const handleDelete = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleCancel = () => {
    setIsAdding(false);
    setForm({ name: '', relationship: '', phone: '' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h3" style={styles.headerTitle}>Emergency Contacts</AppText>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {contacts.length === 0 && !isAdding ? (
            <View style={styles.emptyState}>
              <User color={Colors.neutral[400]} size={48} />
              <AppText variant="bodyLarge" color={Colors.neutral[500]} center style={styles.emptyText}>
                You haven't added any emergency contacts yet.
              </AppText>
            </View>
          ) : (
            contacts.map(contact => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.cardHeader}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(contact.id)}>
                    <Trash2 size={20} color={Colors.error[500]} />
                  </TouchableOpacity>
                </View>
                <Input
                  label="Full Name"
                  placeholder="Enter contact's name"
                  value={contact.name}
                  onChangeText={(text) => updateContact(contact.id, 'name', text)}
                />
                <Input
                  label="Relationship"
                  placeholder="e.g. Mother, Sibling, Friend"
                  value={contact.relationship}
                  onChangeText={(text) => updateContact(contact.id, 'relationship', text)}
                />
                <Input
                  label="Phone Number"
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={contact.phone}
                  onChangeText={(text) => updateContact(contact.id, 'phone', text)}
                />
              </View>
            ))
          )}

          {isAdding && (
            <View style={[styles.contactCard, styles.inlineForm]}>
              <AppText variant="h4" style={styles.formTitle}>Add New Contact</AppText>
              <Input
                label="Full Name"
                placeholder="Enter contact's name"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
              <Input
                label="Relationship"
                placeholder="e.g. Mother, Sibling, Friend"
                value={form.relationship}
                onChangeText={(text) => setForm({ ...form, relationship: text })}
              />
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
              />
              
              <View style={styles.buttonRow}>
                <Button 
                  title="Cancel" 
                  variant="outline" 
                  style={[styles.actionBtn, { marginRight: Spacing.sm }]} 
                  onPress={handleCancel} 
                />
                <Button 
                  title="Save" 
                  style={styles.actionBtn} 
                  onPress={handleSave} 
                />
              </View>
            </View>
          )}
          
          {!isAdding && (
            <Button
              title="Add Emergency Contact"
              leftIcon={<Plus color={Colors.neutral[0]} size={20} />}
              onPress={() => {
                setForm({ name: '', relationship: '', phone: '' });
                setIsAdding(true);
              }}
              style={styles.addBtn}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  backBtn: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  contactCard: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: -Spacing.sm,
    zIndex: 1,
  },
  iconBtn: {
    padding: Spacing.sm,
  },
  addBtn: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  inlineForm: {
    flex: 1,
    width: '100%',
  },
  formTitle: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});

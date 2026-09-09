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
  Modal,
} from 'react-native';

const RELATIONSHIP_OPTIONS = ['Parent', 'Spouse/Partner', 'Child', 'Sibling', 'Grandchild', 'Friend'];
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Phone, Trash2, User, Pencil, X } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { emergencyContactsApi, EmergencyContact } from '../../../api/emergencyContacts';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function EmergencyContactsScreen() {
  const navigation = useNavigation<any>();
  
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isRelationshipModalVisible, setIsRelationshipModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', email: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', relationship: '', phone: '', email: '' });

  const fetchContacts = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await emergencyContactsApi.getContacts();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Fetch contacts error', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load contacts' });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchContacts();
    }, [fetchContacts])
  );

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.relationship) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill in required fields' });
      return;
    }

    try {
      await emergencyContactsApi.createContact({ emergency_contact: form });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Contact added successfully' });
      setIsAdding(false);
      setForm({ name: '', relationship: '', phone: '', email: '' });
      fetchContacts();
    } catch (error) {
      console.log('Create contact error', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add contact' });
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await emergencyContactsApi.updateContact(id, { emergency_contact: editForm });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Contact updated successfully' });
      setEditingId(null);
      fetchContacts();
    } catch (error) {
      console.log('Update contact error', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update contact' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await emergencyContactsApi.deleteContact(id);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Contact deleted successfully' });
      fetchContacts();
    } catch (error) {
      console.log('Delete contact error', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete contact' });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setForm({ name: '', relationship: '', phone: '', email: '' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Emergency Contacts</AppText>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {contacts.length === 0 && !isAdding && !loading ? (
            <View style={styles.emptyContainer}>
              <User color={Colors.neutral[300]} size={48} />
              <AppText variant="h6" style={styles.emptyTitle}>No contacts yet</AppText>
              <AppText variant="bodyMedium" style={styles.emptyText} center>
                You haven't added any emergency contacts yet.
              </AppText>
            </View>
          ) : (
            contacts.map(contact => {
              const isEditing = editingId === contact.id;
              
              return (
                <View key={contact.id} style={styles.contactCard}>
                  <View style={styles.cardHeader}>
                    {isEditing ? (
                      <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: Colors.neutral[100] }]} onPress={() => setEditingId(null)}>
                        <X size={18} color={Colors.neutral[600]} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: Colors.primary[50] }]} onPress={() => {
                        setEditingId(contact.id);
                        setEditForm({ name: contact.name, relationship: contact.relationship, phone: contact.phone, email: contact.email || '' });
                      }}>
                        <Pencil size={18} color={Colors.primary[500]} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: Colors.error[50], marginLeft: 8 }]} onPress={() => handleDelete(contact.id)}>
                      <Trash2 size={18} color={Colors.error[500]} />
                    </TouchableOpacity>
                  </View>
                  <Input
                    label="Full Name"
                    placeholder="Enter contact's name"
                    value={isEditing ? editForm.name : contact.name}
                    onChangeText={(text) => isEditing && setEditForm({ ...editForm, name: text })}
                    editable={isEditing}
                  />
                  {isEditing ? (
                    <TouchableOpacity onPress={() => setIsRelationshipModalVisible(true)} activeOpacity={0.7}>
                      <View pointerEvents="none">
                        <Input
                          label="Relationship"
                          placeholder="Select Relationship"
                          value={editForm.relationship}
                          editable={false}
                        />
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <Input
                      label="Relationship"
                      value={contact.relationship}
                      editable={false}
                    />
                  )}
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    value={isEditing ? editForm.phone : contact.phone}
                    onChangeText={(text) => isEditing && setEditForm({ ...editForm, phone: text })}
                    editable={isEditing}
                  />
                  <Input
                    label="Email (Optional)"
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    value={isEditing ? editForm.email : (contact.email || '')}
                    onChangeText={(text) => isEditing && setEditForm({ ...editForm, email: text })}
                    editable={isEditing}
                  />
                  {isEditing && (
                    <Button 
                      title="Save Changes" 
                      style={{ marginTop: Spacing.sm }} 
                      onPress={() => handleUpdate(contact.id)} 
                    />
                  )}
                </View>
              );
            })
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
              <TouchableOpacity onPress={() => setIsRelationshipModalVisible(true)} activeOpacity={0.7}>
                <View pointerEvents="none">
                  <Input
                    label="Relationship"
                    placeholder="Select Relationship"
                    value={form.relationship}
                    editable={false}
                  />
                </View>
              </TouchableOpacity>
              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
              />
              <Input
                label="Email (Optional)"
                placeholder="Enter email address"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
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
          
          {/* Replace Add Button with FAB below */}
        </ScrollView>
      </KeyboardAvoidingView>

      {!isAdding && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => {
            setForm({ name: '', relationship: '', phone: '', email: '' });
            setIsAdding(true);
          }}
          activeOpacity={0.8}
        >
          <Plus color={Colors.neutral[0]} size={24} />
        </TouchableOpacity>
      )}

      <Modal visible={isRelationshipModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="h5" style={{ color: Colors.neutral[900] }}>Select Relationship</AppText>
              <TouchableOpacity onPress={() => setIsRelationshipModalVisible(false)} style={{ padding: 4 }}>
                <X color={Colors.neutral[500]} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {RELATIONSHIP_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => {
                    if (isAdding) {
                      setForm({ ...form, relationship: option });
                    } else if (editingId) {
                      setEditForm({ ...editForm, relationship: option });
                    }
                    setIsRelationshipModalVisible(false);
                  }}
                >
                  <AppText variant="bodyMedium" color={Colors.neutral[800]}>{option}</AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalOption: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
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
    color: Colors.neutral[900],
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
    marginBottom: Spacing.xs,
    zIndex: 1,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    color: Colors.neutral[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.neutral[500],
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
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

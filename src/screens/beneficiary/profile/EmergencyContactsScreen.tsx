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
  Alert,
} from 'react-native';

const RELATIONSHIP_OPTIONS = ['Parent', 'Spouse/Partner', 'Child', 'Sibling', 'Grandchild', 'Friend'];
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Phone, Trash2, User, Pencil, X, Info, ChevronDown, Check } from 'lucide-react-native';
import { Colors } from '../../../theme/colors';
import { AppText } from '../../../components/AppText';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Spacing, BorderRadius } from '../../../theme/spacing';
import { emergencyContactsApi, EmergencyContact } from '../../../api/emergencyContacts';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const getErrorMessage = (error: any, defaultMsg: string) => {
  console.log("@@@@ errorerrorerror===", error)
  if (error?.data) {
    const data = error.data.errors;
    if (Array.isArray(data)) return data.join(', ');
    if (data.errors) {
      if (Array.isArray(data.errors)) return data.errors.join(', ');
      if (typeof data.errors === 'object') return Object.values(data.errors).flat().join(', ');
      return String(data.errors);
    }
    if (data.error) return String(data.error);
    if (data.message) return String(data.message);
  }
  return error?.message || defaultMsg;
};

export default function EmergencyContactsScreen() {
  const navigation = useNavigation<any>();
  
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isRelationshipModalVisible, setIsRelationshipModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', email: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', relationship: '', phone: '', email: '' });
  
  const [errors, setErrors] = useState<{name?: string, relationship?: string, phone?: string}>({});
  const [editErrors, setEditErrors] = useState<{name?: string, relationship?: string, phone?: string}>({});

  const fetchContacts = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await emergencyContactsApi.getContacts();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Fetch contacts error', error);
      Toast.show({ type: 'error', text1: 'Error', text2: getErrorMessage(error, 'Failed to load contacts') });
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
    const newErrors: any = {};
    if (!form.name) newErrors.name = 'Please enter a name';
    if (!form.relationship) newErrors.relationship = 'Please select a relationship';
    if (!form.phone) newErrors.phone = 'Please enter a phone number';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      await emergencyContactsApi.createContact({ emergency_contact: form });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Contact added successfully' });
      setIsAdding(false);
      setForm({ name: '', relationship: '', phone: '', email: '' });
      fetchContacts();
    } catch (error: any) {
      console.log('Create contact error', error?.response?.data || error);
      Toast.show({ type: 'error', text1: 'Error', text2: getErrorMessage(error, 'Failed to add contact') });
    }
  };

  const handleUpdate = async (id: number) => {
    const newErrors: any = {};
    if (!editForm.name) newErrors.name = 'Please enter a name';
    if (!editForm.relationship) newErrors.relationship = 'Please select a relationship';
    if (!editForm.phone) newErrors.phone = 'Please enter a phone number';

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }
    setEditErrors({});

    try {
      await emergencyContactsApi.updateContact(id, { emergency_contact: editForm });
      Toast.show({ type: 'success', text1: 'Success', text2: 'Contact updated successfully' });
      setEditingId(null);
      fetchContacts();
    } catch (error: any) {
      console.log('Update contact error', error?.response?.data || error);
      Toast.show({ type: 'error', text1: 'Error', text2: getErrorMessage(error, 'Failed to update contact') });
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await emergencyContactsApi.deleteContact(id);
              Toast.show({ type: 'success', text1: 'Success', text2: 'Contact deleted successfully' });
              fetchContacts();
            } catch (error) {
              console.log('Delete contact error', error);
              Toast.show({ type: 'error', text1: 'Error', text2: getErrorMessage(error, 'Failed to delete contact') });
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    setIsAdding(false);
    setForm({ name: '', relationship: '', phone: '', email: '' });
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <AppText variant="h5" style={styles.headerTitle}>Emergency Contacts</AppText>
        <View style={{ width: 36 }} />
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
                      <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: Colors.neutral[100] }]} onPress={() => {
                        setEditingId(null);
                        setEditErrors({});
                      }}>
                        <X size={18} color={Colors.neutral[600]} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: Colors.primary[50] }]} onPress={() => {
                        setEditingId(contact.id);
                        setEditForm({ name: contact.name, relationship: contact.relationship, phone: contact.phone, email: contact.email || '' });
                        setEditErrors({});
                      }}>
                        <Pencil size={18} color={Colors.primary[500]} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.actionIconBtn, { backgroundColor: '#FEF2F2', marginLeft: 8 }]} onPress={() => handleDelete(contact.id)}>
                      <Trash2 size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Input
                    label="Full Name"
                    placeholder="Enter contact's name"
                    value={isEditing ? editForm.name : contact.name}
                    onChangeText={(text) => {
                      if (isEditing) {
                        setEditForm({ ...editForm, name: text });
                        setEditErrors({ ...editErrors, name: undefined });
                      }
                    }}
                    editable={isEditing}
                    error={isEditing ? editErrors.name : undefined}
                  />
                  {isEditing ? (
                    <View>
                      <TouchableOpacity onPress={() => setIsRelationshipModalVisible(!isRelationshipModalVisible)} activeOpacity={0.7}>
                        <View pointerEvents="none">
                          <Input
                            label="Relationship"
                            placeholder="Select Relationship"
                            value={editForm.relationship}
                            editable={false}
                            error={editErrors.relationship}
                            rightIcon={<ChevronDown size={20} color={Colors.neutral[500]} />}
                          />
                        </View>
                      </TouchableOpacity>
                      {isRelationshipModalVisible && (
                        <View style={styles.inlineDropdown}>
                          {RELATIONSHIP_OPTIONS.map((option, index) => {
                            const isSelected = editForm.relationship === option;
                            const isLast = index === RELATIONSHIP_OPTIONS.length - 1;
                            return (
                              <TouchableOpacity
                                key={option}
                                style={[styles.dropdownItem, isLast && { borderBottomWidth: 0 }]}
                                onPress={() => {
                                  setEditForm({ ...editForm, relationship: option });
                                  setEditErrors({ ...editErrors, relationship: undefined });
                                  setIsRelationshipModalVisible(false);
                                }}
                              >
                                <AppText
                                  variant="bodyMedium"
                                  color={isSelected ? Colors.primary[500] : Colors.neutral[800]}
                                  weight={isSelected ? 'bold' : 'regular'}
                                >
                                  {option}
                                </AppText>
                                {isSelected && <Check color={Colors.primary[500]} size={18} />}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  ) : (
                    <Input
                      label="Relationship"
                      value={contact.relationship}
                      editable={false}
                    />
                  )}
                  <View style={{ marginBottom: Spacing.lg }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                      <AppText variant="labelMedium" color={Colors.neutral[700]}>Phone Number</AppText>
                      {/* <Info size={16} color={Colors.primary[500]} style={{ marginLeft: Spacing.xs }} /> */}
                    </View>
                    <Input
                      containerStyle={{ marginBottom: 0 }}
                      placeholder="(201) 555-0123"
                      keyboardType="phone-pad"
                      value={isEditing ? editForm.phone : contact.phone}
                      onChangeText={(text) => {
                        if (isEditing) {
                          setEditForm({ ...editForm, phone: text });
                          setEditErrors({ ...editErrors, phone: undefined });
                        }
                      }}
                      editable={isEditing}
                      error={isEditing ? editErrors.phone : undefined}
                      leftIcon={
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Phone size={18} color={Colors.primary[500]} />
                          <AppText variant="bodyMedium" style={{ marginLeft: Spacing.xs, color: Colors.neutral[900] }}>+1</AppText>
                          <ChevronDown size={16} color={Colors.neutral[500]} style={{ marginLeft: 2 }} />
                          <View style={{ width: 1, height: 24, backgroundColor: Colors.neutral[200], marginLeft: Spacing.sm }} />
                        </View>
                      }
                    />
                  </View>
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
                onChangeText={(text) => {
                  setForm({ ...form, name: text });
                  setErrors({ ...errors, name: undefined });
                }}
                error={errors.name}
              />
              <View>
                <TouchableOpacity onPress={() => setIsRelationshipModalVisible(!isRelationshipModalVisible)} activeOpacity={0.7}>
                  <View pointerEvents="none">
                    <Input
                      label="Relationship"
                      placeholder="Select Relationship"
                      value={form.relationship}
                      editable={false}
                      error={errors.relationship}
                      rightIcon={<ChevronDown size={20} color={Colors.neutral[500]} />}
                    />
                  </View>
                </TouchableOpacity>
                {isRelationshipModalVisible && (
                  <View style={styles.inlineDropdown}>
                    {RELATIONSHIP_OPTIONS.map((option, index) => {
                      const isSelected = form.relationship === option;
                      const isLast = index === RELATIONSHIP_OPTIONS.length - 1;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[styles.dropdownItem, isLast && { borderBottomWidth: 0 }]}
                          onPress={() => {
                            setForm({ ...form, relationship: option });
                            setErrors({ ...errors, relationship: undefined });
                            setIsRelationshipModalVisible(false);
                          }}
                        >
                          <AppText
                            variant="bodyMedium"
                            color={isSelected ? Colors.primary[500] : Colors.neutral[800]}
                            weight={isSelected ? 'bold' : 'regular'}
                          >
                            {option}
                          </AppText>
                          {isSelected && <Check color={Colors.primary[500]} size={18} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
              <View style={{ marginBottom: Spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                  <AppText variant="labelMedium" color={Colors.neutral[700]}>Phone Number</AppText>
                  {/* <Info size={16} color={Colors.primary[500]} style={{ marginLeft: Spacing.xs }} /> */}
                </View>
                <Input
                  containerStyle={{ marginBottom: 0 }}
                  placeholder="(201) 555-0123"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(text) => {
                    setForm({ ...form, phone: text });
                    setErrors({ ...errors, phone: undefined });
                  }}
                  error={errors.phone}
                  leftIcon={
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Phone size={18} color={Colors.primary[500]} />
                      <AppText variant="bodyMedium" style={{ marginLeft: Spacing.xs, color: Colors.neutral[900] }}>+1</AppText>
                      <ChevronDown size={16} color={Colors.neutral[500]} style={{ marginLeft: 2 }} />
                      <View style={{ width: 1, height: 24, backgroundColor: Colors.neutral[200], marginLeft: Spacing.sm }} />
                    </View>
                  }
                />
              </View>
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
                  style={[styles.actionBtn, { marginRight: Spacing.sm, borderRadius: BorderRadius.full }]} 
                  onPress={handleCancel} 
                />
                <Button 
                  title="Save" 
                  style={[styles.actionBtn, { borderRadius: BorderRadius.full }]} 
                  onPress={handleSave} 
                />
              </View>
            </View>
          )}
          
          {/* Replace Add Button with FAB below */}
        </ScrollView>
      </KeyboardAvoidingView>

      {!isAdding && contacts.length < 2 && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => {
            setForm({ name: '', relationship: '', phone: '', email: '' });
            setErrors({});
            setIsAdding(true);
          }}
          activeOpacity={0.8}
        >
          <Plus color={Colors.neutral[0]} size={24} />
        </TouchableOpacity>
      )}


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  inlineDropdown: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginTop: -Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
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
    backgroundColor: Colors.neutral[0],
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
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
    marginBottom: Spacing.lg,
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

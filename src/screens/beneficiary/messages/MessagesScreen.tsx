import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors} from '../../../theme/colors';
import {Typography} from '../../../theme/typography';
import {
  ChevronLeft,
  Edit,
  Search,
} from 'lucide-react-native';

export default function MessagesScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'All' | 'Helpers' | 'Support'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.canGoBack() && navigation.goBack()} 
          style={[styles.iconBtn, !navigation.canGoBack() && {opacity: 0}]}
          disabled={!navigation.canGoBack()}
        >
          <ChevronLeft color={Colors.neutral[900]} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Edit color={Colors.neutral[900]} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search color={Colors.neutral[400]} size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search messages"
            placeholderTextColor={Colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tabContainer}>
          <TabButton title="All" active={activeTab === 'All'} onPress={() => setActiveTab('All')} />
          <TabButton title="Helpers" active={activeTab === 'Helpers'} onPress={() => setActiveTab('Helpers')} />
          <TabButton title="Support" active={activeTab === 'Support'} onPress={() => setActiveTab('Support')} />
        </View>

        <ScrollView style={styles.listContainer}>
          <MessageItem 
            avatar="https://i.pravatar.cc/150?u=james"
            name="James Anderson"
            time="2:00 PM"
            message="Hi Sarah, I'm on my way and will arrive in 10 minutes."
            unreadCount={2}
          />
          <MessageItem 
            isSupport
            name="Uplift Support"
            time="1:15 PM"
            message="Thank you for reaching out. How can we assist you?"
            unreadCount={1}
          />
          <MessageItem 
            avatar="https://i.pravatar.cc/150?u=emily"
            name="Emily Carter"
            time="Yesterday"
            message="Thank you so much for your help yesterday!"
          />
          <MessageItem 
            avatar="https://i.pravatar.cc/150?u=david"
            name="David Williams"
            time="Yesterday"
            message="Your request has been completed."
          />
          <MessageItem 
            avatar="https://i.pravatar.cc/150?u=olivia"
            name="Olivia Brown"
            time="May 20"
            message="Let me know if you need anything else."
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const TabButton = ({title, active, onPress}: {title: string, active: boolean, onPress: () => void}) => (
  <TouchableOpacity 
    style={[styles.tab, active && styles.activeTab]}
    onPress={onPress}
  >
    <Text style={[styles.tabText, active && styles.activeTabText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const MessageItem = ({avatar, name, time, message, unreadCount, isSupport}: any) => (
  <TouchableOpacity style={styles.messageItem}>
    {isSupport ? (
      <View style={styles.supportAvatar}>
        <Text style={styles.supportAvatarText}>U</Text>
      </View>
    ) : (
      <Image source={{uri: avatar}} style={styles.avatar} />
    )}
    <View style={styles.messageContent}>
      <View style={styles.messageHeader}>
        <Text style={[styles.name, unreadCount > 0 && styles.nameUnread]}>{name}</Text>
        <Text style={[styles.time, unreadCount > 0 && styles.timeUnread]}>{time}</Text>
      </View>
      <View style={styles.messageRow}>
        <Text style={[styles.messageText, unreadCount > 0 && styles.messageTextUnread]} numberOfLines={2}>
          {message}
        </Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    ...Typography.h5,
    color: Colors.neutral[900],
  },
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary[500],
  },
  tabText: {
    ...Typography.labelMedium,
    color: Colors.neutral[500],
  },
  activeTabText: {
    color: Colors.primary[500],
  },
  listContainer: {
    flex: 1,
  },
  messageItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  supportAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  supportAvatarText: {
    ...Typography.h5,
    color: Colors.neutral[0],
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
  },
  nameUnread: {
    color: Colors.neutral[900],
  },
  time: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  timeUnread: {
    color: Colors.primary[500],
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  messageText: {
    ...Typography.caption,
    color: Colors.neutral[500],
    flex: 1,
    lineHeight: 18,
    paddingRight: 16,
  },
  messageTextUnread: {
    color: Colors.neutral[900],
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: Colors.primary[500],
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  unreadText: {
    ...Typography.caption,
    color: Colors.neutral[0],
    fontSize: 10,
    fontWeight: '600',
  },
});

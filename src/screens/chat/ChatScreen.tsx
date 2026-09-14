import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';
import { AppText } from '../../components/AppText';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/responsive';
import { chatApi, ChatMessage } from '../../api/chatApi';
import { chatCable } from '../../services/chatCable';
import { api, getFullImageUrl } from '../../api/client';
import Toast from 'react-native-toast-message';
import {
  ChevronLeft,
  Send,
} from 'lucide-react-native';

interface ChatRouteParams {
  helpRequestId: number;
  assignmentId: number;
  recipientName: string;
  recipientAvatar?: string | null;
  requestStatus?: string;
}

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    helpRequestId,
    assignmentId,
    recipientName,
    recipientAvatar,
    requestStatus,
  } = (route.params || {}) as ChatRouteParams;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Determine if chat input is enabled
  const status = (requestStatus || '').toLowerCase();
  const canSend = ['accepted', 'on_the_way'].includes(status);

  // Fetch current user profile to identify sent vs received messages
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile: any = await api.get('/profile');
        if (profile?.id) {
          setCurrentUserId(profile.id);
        } else if (profile?.data?.id) {
          setCurrentUserId(profile.data.id);
        }
      } catch (e) {
        console.error('[Chat] Failed to fetch profile', e);
      }
    };
    fetchProfile();
  }, []);

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!helpRequestId || !assignmentId) return;
    try {
      const data = await chatApi.getMessages(helpRequestId, assignmentId);
      // Filter out empty messages and reverse for inverted FlatList
      const validMessages = data.filter(m => m.body && m.body.trim().length > 0);
      setMessages(validMessages.reverse()); 
    } catch (error) {
      console.error('[Chat] Failed to load messages', error);
    } finally {
      setLoading(false);
    }
  }, [helpRequestId, assignmentId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // WebSocket subscription
  useEffect(() => {
    if (!helpRequestId || !assignmentId) return;

    chatCable.connect(helpRequestId, assignmentId);
    chatCable.onMessage((data: any) => {
      // Incoming message from Action Cable
      const newMsg: ChatMessage = data.message || data;
      if (!newMsg.body || !newMsg.body.trim()) return; // Ignore empty messages
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.some(m => m.id === newMsg.id);
        if (exists) return prev;
        return [newMsg, ...prev];
      });
    });

    return () => {
      chatCable.disconnect();
    };
  }, [helpRequestId, assignmentId]);

  // Send message
  const handleSend = async () => {
    const body = inputText.trim();
    if (!body || sending) return;

    setSending(true);
    setInputText('');

    try {
      const sentMsg = await chatApi.sendMessage(helpRequestId, body, assignmentId);
      // Add to local list optimistically (Action Cable will also broadcast it)
      if (sentMsg && sentMsg.body && sentMsg.body.trim().length > 0) {
        setMessages(prev => {
          const exists = prev.some(m => m.id === sentMsg.id);
          if (exists) return prev;
          return [sentMsg, ...prev];
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to send message',
      });
      setInputText(body); // Restore text on failure
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Render a single message bubble
  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    if (!item.body || !item.body.trim()) return null;

    const isMine = currentUserId !== null && (item.sender_id == currentUserId || item.sender?.id == currentUserId);
    const showTimestamp = index === 0 || 
      (index > 0 && 
        new Date(item.created_at).getTime() - new Date(messages[index - 1]?.created_at || 0).getTime() > 5 * 60 * 1000
      );

    return (
      <View>
        {showTimestamp && (
          <View style={styles.timestampContainer}>
            <AppText variant="caption" color={Colors.neutral[400]} style={styles.timestampText}>
              {formatTime(item.created_at)}
            </AppText>
          </View>
        )}
        <View style={[styles.messageRow, isMine ? styles.messageRowSent : styles.messageRowReceived]}>
          {!isMine && (
            <View style={styles.avatarSmall}>
              {recipientAvatar ? (
                <Image
                  source={{ uri: getFullImageUrl(recipientAvatar) as string }}
                  style={styles.avatarSmallImage}
                />
              ) : (
                <AppText variant="caption" color={Colors.neutral[0]} weight="semiBold">
                  {getInitials(recipientName || 'U')}
                </AppText>
              )}
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isMine ? styles.bubbleSent : styles.bubbleReceived,
            ]}
          >
            <AppText
              variant="bodySmall"
              color={isMine ? Colors.neutral[0] : Colors.neutral[900]}
              style={{ lineHeight: 20 }}
            >
              {item.body}
            </AppText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.neutral[0] }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary[500] }} />
      <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.neutral[0]} size={28} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            {recipientAvatar ? (
              <Image
                source={{ uri: getFullImageUrl(recipientAvatar) as string }}
                style={styles.headerAvatarImage}
              />
            ) : (
              <AppText variant="labelMedium" color={Colors.primary[500]} weight="semiBold">
                {getInitials(recipientName || 'User')}
              </AppText>
            )}
          </View>
          <View style={{ marginLeft: 12 }}>
            <AppText variant="labelLarge" color={Colors.neutral[0]} numberOfLines={1}>
              {recipientName || 'Chat'}
            </AppText>
            {/* {canSend && (
              <AppText variant="caption" color={Colors.secondary[500]}>
                Online
              </AppText>
            )} */}
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <View style={styles.chatContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppText variant="bodyMedium" color={Colors.neutral[400]} center>
                  No messages yet.{'\n'}Start the conversation!
                </AppText>
              </View>
            }
          />
        )}

        {/* Input Bar or Disabled Banner */}
        {canSend ? (
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.neutral[400]}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || sending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || sending}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={Colors.neutral[0]} />
                ) : (
                  <Send color={Colors.neutral[0]} size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.disabledBanner}>
            <AppText variant="caption" color={Colors.neutral[500]} center>
              Chat is no longer available for this request.
            </AppText>
          </View>
        )}
      </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary[500],
    backgroundColor: Colors.primary[500],
  },
  backBtn: {
    padding: moderateScale(4),
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: horizontalScale(8),
  },
  headerAvatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(16),
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(80),
    transform: [{ scaleY: -1 }], // Counteract inverted FlatList
  },
  timestampContainer: {
    alignItems: 'center',
    marginVertical: verticalScale(12),
  },
  timestampText: {
    fontSize: 11,
    fontFamily: FontFamily.regular,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(8),
    alignItems: 'flex-end',
  },
  messageRowSent: {
    justifyContent: 'flex-end',
  },
  messageRowReceived: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(8),
    overflow: 'hidden',
  },
  avatarSmallImage: {
    width: '100%',
    height: '100%',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: horizontalScale(14),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(18),
  },
  bubbleSent: {
    backgroundColor: Colors.primary[500],
    borderBottomRightRadius: moderateScale(4),
  },
  bubbleReceived: {
    backgroundColor: Colors.neutral[100],
    borderBottomLeftRadius: moderateScale(4),
  },
  inputContainer: {
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(10),
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: moderateScale(24),
    paddingHorizontal: horizontalScale(16),
    paddingVertical: Platform.OS === 'ios' ? verticalScale(8) : verticalScale(4),
    minHeight: moderateScale(48),
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: Colors.neutral[900],
    maxHeight: 100,
    paddingTop: Platform.OS === 'ios' ? 0 : verticalScale(4),
    paddingBottom: Platform.OS === 'ios' ? 0 : verticalScale(4),
  },
  sendButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: horizontalScale(8),
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  disabledBanner: {
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(24),
    backgroundColor: Colors.neutral[100],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { Header } from '../../components/Header';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function ChatsScreen() {
  const router = useRouter();
  const { chats } = useApp();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your Skin Consultations</Text>

        {chats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptyText}>
              Start a new consultation to get personalized skincare advice
            </Text>
          </View>
        ) : (
          chats.map((chat, index) => (
            <Animated.View
              key={chat.id}
              entering={FadeInRight.delay(index * 100)}
            >
              <TouchableOpacity
                style={styles.chatCard}
                onPress={() => router.push(`/chat/${chat.id}` as any)}
                activeOpacity={0.7}
              >
                <Image source={{ uri: chat.image }} style={styles.chatImage} />
                <View style={styles.chatContent}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatTitle} numberOfLines={1}>
                      {chat.title}
                    </Text>
                    <Text style={styles.chatDate}>{formatDate(chat.date)}</Text>
                  </View>
                  <Text style={styles.chatDescription} numberOfLines={2}>
                    {chat.description}
                  </Text>
                  {chat.routineCreated && (
                    <View style={styles.routineBadge}>
                      <Text style={styles.routineBadgeText}>Routine Created</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // console.log('Index: FAB pressed - navigating to new chat');
          try {
            router.push('/chat/new');
            // console.log('Index: Navigation to /chat/new initiated');
          } catch (error) {
            console.error('Index: Navigation error', error);
          }
        }}
        activeOpacity={0.8}
      >
        <Plus size={28} color={colors.surface} strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  chatImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
  chatContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  chatTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  chatDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chatDescription: {
    ...typography.bodySmall,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  routineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  routineBadgeText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
});

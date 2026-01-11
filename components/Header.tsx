import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, User } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user } = useAuth();
  const { notifications } = useApp();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity style={styles.profileButton}>
          <View style={styles.avatar}>
            <User size={20} color={colors.primary} strokeWidth={2} />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => {
          console.log('Header: Notification button pressed, navigating to /notifications');
          try {
            router.push('/notifications');
            console.log('Header: Navigation initiated');
          } catch (error) {
            console.error('Header: Navigation error', error);
          }
        }}
      >
        <Bell size={24} color={colors.text} strokeWidth={2} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  greeting: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  notificationButton: {
    padding: spacing.sm,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...typography.caption,
    color: colors.surface,
    fontWeight: '700',
    fontSize: 10,
  },
});

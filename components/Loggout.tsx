import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

export default function LoggoutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
        //   console.log('Profile: Logout button pressed');
          try {
            await logout();
            // console.log('Profile: Logout successful, navigating to login');
            router.replace('/login');
          } catch (error) {
            // console.error('Profile: Logout error', error);
          }
        },
      },
    ]);
  };


  return (
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={colors.error} strokeWidth={2} />
        <Text style={styles.logoutButtonText}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error,
    ...shadows.small,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.error,
    marginLeft: spacing.sm,
  }
});

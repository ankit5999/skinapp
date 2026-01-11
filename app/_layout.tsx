import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { AppProvider } from '../contexts/AppContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

function RootLayoutNav() {
  const { user, isAdmin, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    console.log('Navigation check:', { user: !!user, isAdmin, segments: segments[0] });

    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'coming-soon';
    const inProtectedRoute = segments[0] === 'chat' || segments[0] === 'routine' || segments[0] === 'notifications';

    if (!user && (inAuthGroup || inProtectedRoute)) {
      console.log('Redirecting to login - no user in protected route');
      router.replace('/login');
    } else if (user && !inAuthGroup && !inProtectedRoute) {
      if (isAdmin) {
        console.log('Redirecting admin to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('Redirecting regular user to coming-soon');
        router.replace('/coming-soon');
      }
    }
  }, [user, isAdmin, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="coming-soon" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="chat/new" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="routine/[id]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <AppProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

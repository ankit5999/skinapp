import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../contexts/AppContext';
import { Header } from '../../components/Header';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function RoutinesScreen() {
  const router = useRouter();
  const { routines } = useApp();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateProgress = (tasks: any[]) => {
    const completedTasks = tasks.filter((t) => t.completed).length;
    return {
      completed: completedTasks,
      total: tasks.length,
      percentage: (completedTasks / tasks.length) * 100,
    };
  };

  const getDaysRemaining = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remaining = 7 - diffDays;
    return remaining > 0 ? remaining : 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Your Skincare Routines</Text>

        {routines.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No routines yet</Text>
            <Text style={styles.emptyText}>
              Create a routine from your skin consultations to start tracking your progress
            </Text>
          </View>
        ) : (
          routines.map((routine, index) => {
            const progress = calculateProgress(routine.tasks);
            const daysRemaining = getDaysRemaining(routine.startDate);

            return (
              <Animated.View
                key={routine.id}
                entering={FadeInRight.delay(index * 100)}
              >
                <TouchableOpacity
                  style={styles.routineCard}
                  onPress={() => router.push(`/routine/${routine.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.routineHeader}>
                    <Text style={styles.routineName}>{routine.name}</Text>
                    <Text style={styles.routineDate}>{formatDate(routine.startDate)}</Text>
                  </View>

                  <Text style={styles.routineDescription} numberOfLines={2}>
                    {routine.description}
                  </Text>

                  <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Progress</Text>
                      <Text style={styles.statValue}>
                        {progress.completed}/{progress.total} done
                      </Text>
                    </View>

                    <View style={styles.stat}>
                      <Text style={styles.statLabel}>Days Left</Text>
                      <Text style={styles.statValue}>{daysRemaining} days</Text>
                    </View>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${progress.percentage}%` },
                      ]}
                    />
                  </View>

                  <Text style={styles.progressText}>
                    {progress.percentage.toFixed(0)}% Complete
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
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
  routineCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  routineName: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  routineDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  routineDescription: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs / 2,
  },
  statValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
});

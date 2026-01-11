import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { diseases, products } from '../../constants/dummyData';
import Animated, { FadeInLeft, FadeInRight, SlideInDown, SlideInLeft, SlideInRight, SlideInUp } from 'react-native-reanimated';

export default function ChatDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { chats, createRoutineFromChat } = useApp();

  const chat = chats.find((c) => c.id === id);

  if (!chat) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Chat not found</Text>
      </SafeAreaView>
    );
  }

  const disease = diseases.find((d) => d.id === chat.diseaseId);

  const handleCreateRoutine = () => {
    createRoutineFromChat(chat.id);
    router.push('/(tabs)/routines');
  };

  const handleViewRoutine = () => {
    router.push('/(tabs)/routines');
  };

  const messages = [
    {
      id: 'analysis',
      type: 'ai',
      content: `Based on the image analysis, I've identified: **${disease?.name}**\n\n${disease?.description}`,
    },
    {
      id: 'severity',
      type: 'ai',
      content: `Severity Level: **${disease?.severity}**`,
    },
    {
      id: 'precautions',
      type: 'ai',
      content: `Here are some precautions you should take:\n\n${disease?.precautions
        .map((p, i) => `${i + 1}. ${p}`)
        .join('\n')}`,
    },
  ];

  const recommendedProducts = products.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chat.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
        entering={FadeInLeft.delay(100)}
        style={styles.imageContainer}>
          <Image source={{ uri: chat.image }} style={styles.chatImage} />
        </Animated.View>

        {messages.map((message, index) => (
          <Animated.View
            key={message.id}
            entering={FadeInLeft.delay((index + 2) * 100)}
            style={styles.aiMessageWrapper}
          >
            <View style={styles.aiMessage}>
              <Text style={styles.aiMessageText}>{message.content}</Text>
            </View>
          </Animated.View>
        ))}

        <View style={styles.actionsContainer}>
          {chat.routineCreated ? (
            <TouchableOpacity style={styles.routineButton} onPress={handleViewRoutine}>
              <Text style={styles.routineButtonText}>View Routine</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.routineButton} onPress={handleCreateRoutine}>
              <Text style={styles.routineButtonText}>Create Skincare Routine</Text>
            </TouchableOpacity>
          )}

          <View style={styles.productsContainer}>
            <Text style={styles.productsTitle}>Recommended Products</Text>
            {recommendedProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => router.push('/(tabs)/shopping')}
              >
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* {chat.routineCreated && (
          <View style={styles.disabledNote}>
            <Text style={styles.disabledNoteText}>
              Chat is now complete. A routine has been created for you!
            </Text>
          </View>
        )} */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    // paddingVertical: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  imageContainer: {
    marginBottom: spacing.lg,
  },
  chatImage: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  aiMessage: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.small,
  },
  aiMessageText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  actionsContainer: {
    marginTop: spacing.md,
  },
  routineButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
    marginBottom: spacing.lg,
  },
  routineButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  productsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.small,
  },
  productsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  productName: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productPrice: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  disabledNote: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  disabledNoteText: {
    ...typography.bodySmall,
    color: colors.text,
    textAlign: 'center',
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Send } from 'lucide-react-native';
import { useApp } from '../../contexts/AppContext';
import { Chat, Message } from '../../types';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { diseases, products } from '../../constants/dummyData';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function NewChatScreen() {
  const router = useRouter();
  const { addChat, updateChat, addNotification, createRoutineFromChat, addMessageToChat, chats, routines } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [diseaseShown, setDiseaseShown] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [typingMessage, setTypingMessage] = useState<string>('');
  const [routineCreated, setRoutineCreated] = useState(false);
  const [createdRoutineId, setCreatedRoutineId] = useState<string | null>(null);
  const [inputLocked, setInputLocked] = useState(true);



  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    (async () => {
      setInputLocked(true);
      await showWelcomeMessage(); // waits for typing animation
      setInputLocked(false);
    })();
  }, []);


  const showWelcomeMessage = async () => {
    await addTypingMessage(
      'Hey, welcome! Let me know what you want to know about your skin care. Upload an image so I can diagnose and check the issue you are facing.'
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);

      setDiseaseShown(false);

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        type: 'user',
        content: 'I uploaded an image of my skin concern',
        timestamp: new Date().toISOString(),
        image: imageUri,
      };

      setMessages((prev) => [...prev, userMessage]);
      setTimeout(() => processImage(imageUri), 500);
    }
  };

  const addTypingMessage = async (content: string) => {
    setTypingMessage('');
    const words = content.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setTypingMessage(currentText);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'ai',
      content: content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setTypingMessage('');
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  const processImage = async (imageUri: string) => {
    setProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
    setSelectedDisease(randomDisease.id);

    if (currentChatId) {
      updateChat(currentChatId, {
        title: randomDisease.name,
        image: imageUri,
        diseaseId: randomDisease.id,
      });
    } else {
      const chatId = saveChat(randomDisease.name, imageUri, randomDisease.id);
      setCurrentChatId(chatId);
    }

    setProcessing(false);

    await addTypingMessage(
      `Based on the image analysis, I've identified: **${randomDisease.name}**\n\n${randomDisease.description}`
    );

    await addTypingMessage(`Severity Level: **${randomDisease.severity}**`);

    const precautionsText = randomDisease.precautions
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n');
    await addTypingMessage(`Here are some precautions you should take:\n\n${precautionsText}`);

    await addTypingMessage('Would you like me to create a personalized 7-day skincare routine for you?');

    setDiseaseShown(true);
  };

  const saveChat = (title: string, image: string, diseaseId: string): string => {
    const chatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: chatId,
      title: title,
      description: 'Skin consultation and diagnosis',
      image: image,
      date: new Date().toISOString(),
      messages: [],
      diseaseId: diseaseId,
      routineCreated: false,
    };

    addChat(newChat);

    addNotification({
      title: 'New Consultation',
      message: `Your consultation for ${title} has been saved.`,
      date: new Date().toISOString(),
      read: false,
      type: 'account',
    });

    return chatId;
  };

  const handleCreateRoutine = () => {
    if (currentChatId && !routineCreated) {
      createRoutineFromChat(currentChatId);
      setRoutineCreated(true);

      setTimeout(() => {
        const chat = chats.find(c => c.id === currentChatId);
        if (chat?.routineCreated) {
          const routine = routines.find(r => r.chatId === currentChatId);
          if (routine) {
            setCreatedRoutineId(routine.id);
            router.push('/(tabs)/routines');
          }
        }
      }, 500);
    } else if (createdRoutineId) {
      router.push('/(tabs)/routines');
    }
  };

  const handleViewRoutine = () => {
    router.push('/(tabs)/routines');
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    setDiseaseShown(false);

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: messageInput,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (currentChatId) {
      addMessageToChat(currentChatId, userMessage);
    }
    setMessageInput('');

    await new Promise((resolve) => setTimeout(resolve, 500));
    await addTypingMessage('Please upload an image so I can better assist you with your skin concern.');
  };

  const renderProducts = () => {
    const recommendedProducts = products.slice(0, 3);

    return (
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
    );
  };


  const renderFormattedText = (text: string, isUser: boolean) => {
  const parts = text.split('**');

  return parts.map((part, index) => {
    const isBold = index % 2 === 1;

    return (
      <Text
        key={index}
        style={[
          styles.messageText,
          isUser ? styles.userMessageText : styles.aiMessageText,
          isBold && { fontWeight: '700', color: colors.primary },
        ]}
      >
        {part}
      </Text>
    );
  });
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Consultation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.type === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
            ]}
          >
            <View
  style={[
    styles.messageWrapper,
    message.type === 'user'
      ? styles.userMessageWrapper
      : styles.aiMessageWrapper,
  ]}
>
  {message.image && (
    <Image
      source={{ uri: message.image }}
      style={styles.chatImage}
    />
  )}

  {/* <View
    style={[
      styles.messageBubble,
      message.type === 'user'
        ? styles.userMessage
        : styles.aiMessage,
    ]}
  > */}
  <View
  style={[
    styles.messageBubble,
    message.type === 'user'
      ? styles.userMessage
      : styles.aiMessage,
    message.image && {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
  ]}
>
  <Text>
  {renderFormattedText(message.content, message.type === 'user')}
</Text>


    {/* <Text
      style={[
        styles.messageText,
        message.type === 'user'
          ? styles.userMessageText
          : styles.aiMessageText,
      ]}
    >
      {message.content}
    </Text> */}
  </View>
</View>

            {/* <View
              style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userMessage : styles.aiMessage,
                message.image && { maxWidth: '90%' },
              ]}
            >
              {message.image && (
                <Image
                  source={{ uri: message.image }}
                  style={styles.messageImage}
                  onError={(error) => console.log('Image load error:', error)}
                />
              )}
              <Text
                style={[
                  styles.messageText,
                  message.type === 'user' ? styles.userMessageText : styles.aiMessageText,
                ]}
              >
                {message.content}
              </Text>
            </View> */}
          </View>
        ))}

        {typingMessage && (
          // <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
          <View style={[styles.aiMessageWrapper, { marginBottom: spacing.sm }]}>
            <View style={[styles.messageBubble, styles.aiMessage]}>
              <Text style={[styles.messageText, styles.aiMessageText]}>
                {typingMessage}
              </Text>
            </View>
          </View>
        )}

        {processing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.processingText}>Analyzing your image...</Text>
          </View>
        )}

        {diseaseShown && !processing && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.actionsContainer}>
            {routineCreated ? (
              <TouchableOpacity style={styles.routineButton} onPress={handleViewRoutine}>
                <Text style={styles.routineButtonText}>View Routine</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.routineButton} onPress={handleCreateRoutine}>
                <Text style={styles.routineButtonText}>Create Skincare Routine</Text>
              </TouchableOpacity>
            )}
            {renderProducts()}
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        {/* <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
          <Camera size={24} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={[
            styles.cameraButton,
            inputLocked && { opacity: 0.4 }
          ]}
          onPress={pickImage}
          disabled={inputLocked}
        >
          <Camera size={24} color={colors.primary} strokeWidth={2} />
        </TouchableOpacity>

        {/* <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor={colors.textMuted}
          value={messageInput}
          onChangeText={setMessageInput}
          multiline
        /> */}
        <TextInput
          style={[
            styles.input,
            inputLocked && { opacity: 0.5 }
          ]}
          placeholder="Type your message..."
          placeholderTextColor={colors.textMuted}
          value={messageInput}
          onChangeText={setMessageInput}
          multiline
          editable={!inputLocked}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputLocked && { opacity: 0.4 }
          ]}
          onPress={sendMessage}
          disabled={inputLocked}
        >
          <Send size={20} color={colors.surface} strokeWidth={2} />
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Send size={20} color={colors.surface} strokeWidth={2} />
        </TouchableOpacity> */}
      </View>
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
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
  },
  messageWrapper: {
    // marginBottom: spacing.md,
    marginBottom: spacing.sm,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  // messageBubble: {
  //   maxWidth: '80%',
  //   borderRadius: borderRadius.md,
  //   padding: spacing.md,
  //   ...shadows.small,
  // },
  messageBubble: {
  maxWidth: '80%',
  padding: spacing.md,
  borderBottomLeftRadius: borderRadius.md,
  borderBottomRightRadius: borderRadius.md,
  borderTopLeftRadius: borderRadius.md,
  borderTopRightRadius: borderRadius.md,
  ...shadows.small,
},

  userMessage: {
    backgroundColor: colors.primary,
  },
  aiMessage: {
    backgroundColor: colors.surface,
  },
  messageText: {
    ...typography.body,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.surface,
  },
  aiMessageText: {
    color: colors.text,
  },
  // messageImage: {
  //   width: '100%',
  //   height: 200,
  //   borderRadius: borderRadius.sm,
  //   marginBottom: spacing.sm,
  // },
//   chatImage: {
//   width: 260,
//   height: 260,
//   borderRadius: borderRadius.md,
//   marginBottom: spacing.xs,
//   backgroundColor: colors.border,
//   alignSelf: 'flex-end', // user image alignment
// },
chatImage: {
  width: 250,
  height: 160,
  borderTopLeftRadius: borderRadius.md,
  borderTopRightRadius: borderRadius.md,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  backgroundColor: colors.border,
  marginBottom: 0,        // ❗ remove gap
},

  messageImage: {
  width: '100%',
  height: 220,
  borderRadius: borderRadius.sm,
  marginBottom: spacing.sm,
  resizeMode: 'cover',
  backgroundColor: colors.border,
},

  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  processingText: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginLeft: spacing.sm,
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
  routineButtonCreated: {
    backgroundColor: colors.primary,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cameraButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.sm,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
});




// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   Image,
//   Alert,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker';
// import { ArrowLeft, Camera, Send } from 'lucide-react-native';
// import { useApp } from '../../contexts/AppContext';
// import { Chat, Message } from '../../types';
// import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
// import { diseases, products } from '../../constants/dummyData';
// import Animated, { FadeIn } from 'react-native-reanimated';

// export default function NewChatScreen() {
//   const router = useRouter();
//   const { addChat, updateChat, addNotification, createRoutineFromChat, chats, routines } = useApp();
//   const scrollViewRef = useRef<ScrollView>(null);

//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 'welcome',
//       type: 'ai',
//       content:
//         'Hey, welcome! Let me know what you want to know about your skin care. Upload an image so I can diagnose and check the issue you are facing.',
//       timestamp: new Date().toISOString(),
//     },
//   ]);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [processing, setProcessing] = useState(false);
//   const [diseaseShown, setDiseaseShown] = useState(false);
//   const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
//   const [currentChatId, setCurrentChatId] = useState<string | null>(null);
//   const [messageInput, setMessageInput] = useState('');
//   const [typingMessage, setTypingMessage] = useState<string>('');
//   const [routineCreated, setRoutineCreated] = useState(false);
//   const [createdRoutineId, setCreatedRoutineId] = useState<string | null>(null);

//   const pickImage = async () => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

//     if (permissionResult.granted === false) {
//       Alert.alert('Permission Required', 'Permission to access camera roll is required!');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled && result.assets[0]) {
//       const imageUri = result.assets[0].uri;
//       setSelectedImage(imageUri);

//       setDiseaseShown(false);

//       const userMessage: Message = {
//         id: `msg-${Date.now()}`,
//         type: 'user',
//         content: 'I uploaded an image of my skin concern',
//         timestamp: new Date().toISOString(),
//         image: imageUri,
//       };

//       setMessages((prev) => [...prev, userMessage]);
//       setTimeout(() => processImage(imageUri), 500);
//     }
//   };

//   const addTypingMessage = async (content: string) => {
//     setTypingMessage('');
//     const words = content.split(' ');
//     let currentText = '';

//     for (let i = 0; i < words.length; i++) {
//       currentText += (i > 0 ? ' ' : '') + words[i];
//       setTypingMessage(currentText);
//       await new Promise((resolve) => setTimeout(resolve, 50));
//     }

//     const newMessage: Message = {
//       id: `msg-${Date.now()}`,
//       type: 'ai',
//       content: content,
//       timestamp: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, newMessage]);
//     setTypingMessage('');
//     await new Promise((resolve) => setTimeout(resolve, 300));
//   };

//   const processImage = async (imageUri: string) => {
//     setProcessing(true);

//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
//     setSelectedDisease(randomDisease.id);

//     if (currentChatId) {
//       updateChat(currentChatId, {
//         title: randomDisease.name,
//         image: imageUri,
//         diseaseId: randomDisease.id,
//       });
//     } else {
//       const chatId = saveChat(randomDisease.name, imageUri, randomDisease.id);
//       setCurrentChatId(chatId);
//     }

//     setProcessing(false);

//     await addTypingMessage(
//       `Based on the image analysis, I've identified: **${randomDisease.name}**\n\n${randomDisease.description}`
//     );

//     await addTypingMessage(`Severity Level: **${randomDisease.severity}**`);

//     const precautionsText = randomDisease.precautions
//       .map((p, i) => `${i + 1}. ${p}`)
//       .join('\n');
//     await addTypingMessage(`Here are some precautions you should take:\n\n${precautionsText}`);

//     await addTypingMessage('Would you like me to create a personalized 7-day skincare routine for you?');

//     setDiseaseShown(true);
//   };

//   const saveChat = (title: string, image: string, diseaseId: string): string => {
//     const chatId = `chat-${Date.now()}`;
//     const newChat: Chat = {
//       id: chatId,
//       title: title,
//       description: 'Skin consultation and diagnosis',
//       image: image,
//       date: new Date().toISOString(),
//       messages: [],
//       diseaseId: diseaseId,
//       routineCreated: false,
//     };

//     addChat(newChat);

//     addNotification({
//       title: 'New Consultation',
//       message: `Your consultation for ${title} has been saved.`,
//       date: new Date().toISOString(),
//       read: false,
//       type: 'account',
//     });

//     return chatId;
//   };

//   const handleCreateRoutine = () => {
//     if (currentChatId && !routineCreated) {
//       createRoutineFromChat(currentChatId);
//       setRoutineCreated(true);

//       setTimeout(() => {
//         const chat = chats.find(c => c.id === currentChatId);
//         if (chat?.routineCreated) {
//           const routine = routines.find(r => r.chatId === currentChatId);
//           if (routine) {
//             setCreatedRoutineId(routine.id);
//             Alert.alert(
//               'Routine Created!',
//               'Your personalized skincare routine has been created successfully.',
//               [
//                 {
//                   text: 'View Routine',
//                   onPress: () => router.push(`/routine/${routine.id}`),
//                 },
//                 {
//                   text: 'Close',
//                   style: 'cancel',
//                 },
//               ]
//             );
//           }
//         }
//       }, 500);
//     } else if (createdRoutineId) {
//       router.push(`/routine/${createdRoutineId}`);
//     }
//   };

//   const sendMessage = () => {
//     if (!messageInput.trim()) return;

//     setDiseaseShown(false);

//     const userMessage: Message = {
//       id: `msg-${Date.now()}`,
//       type: 'user',
//       content: messageInput,
//       timestamp: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setMessageInput('');

//     setTimeout(() => {
//       const aiMessage: Message = {
//         id: `msg-${Date.now()}-ai`,
//         type: 'ai',
//         content: 'Please upload an image so I can better assist you with your skin concern.',
//         timestamp: new Date().toISOString(),
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     }, 500);
//   };

//   const renderProducts = () => {
//     const recommendedProducts = products.slice(0, 3);

//     return (
//       <View style={styles.productsContainer}>
//         <Text style={styles.productsTitle}>Recommended Products</Text>
//         {recommendedProducts.map((product) => (
//           <View key={product.id} style={styles.productCard}>
//             <Image source={{ uri: product.image }} style={styles.productImage} />
//             <View style={styles.productInfo}>
//               <Text style={styles.productName}>{product.name}</Text>
//               <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
//             </View>
//           </View>
//         ))}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>New Consultation</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.messagesContainer}
//         contentContainerStyle={styles.messagesContent}
//         showsVerticalScrollIndicator={false}
//         onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
//       >
//         {messages.map((message, index) => (
//           <View
//             key={message.id}
//             style={[
//               styles.messageWrapper,
//               message.type === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
//             ]}
//           >
//             <View
//               style={[
//                 styles.messageBubble,
//                 message.type === 'user' ? styles.userMessage : styles.aiMessage,
//               ]}
//             >
//               {message.image && (
//                 <Image source={{ uri: message.image }} style={styles.messageImage} />
//               )}
//               <Text
//                 style={[
//                   styles.messageText,
//                   message.type === 'user' ? styles.userMessageText : styles.aiMessageText,
//                 ]}
//               >
//                 {message.content}
//               </Text>
//             </View>
//           </View>
//         ))}

//         {typingMessage && (
//           <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
//             <View style={[styles.messageBubble, styles.aiMessage]}>
//               <Text style={[styles.messageText, styles.aiMessageText]}>
//                 {typingMessage}
//               </Text>
//             </View>
//           </View>
//         )}

//         {processing && (
//           <View style={styles.processingContainer}>
//             <ActivityIndicator size="small" color={colors.primary} />
//             <Text style={styles.processingText}>Analyzing your image...</Text>
//           </View>
//         )}

//         {diseaseShown && !processing && (
//           <Animated.View entering={FadeIn.duration(500)} style={styles.actionsContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.routineButton,
//                 routineCreated && styles.routineButtonCreated,
//               ]}
//               onPress={handleCreateRoutine}
//             >
//               <Text style={styles.routineButtonText}>
//                 {routineCreated ? 'View Routine' : 'Create Skincare Routine'}
//               </Text>
//             </TouchableOpacity>
//             {renderProducts()}
//           </Animated.View>
//         )}
//       </ScrollView>

//       <View style={styles.inputContainer}>
//         <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
//           <Camera size={24} color={colors.primary} strokeWidth={2} />
//         </TouchableOpacity>
//         <TextInput
//           style={styles.input}
//           placeholder="Type your message..."
//           placeholderTextColor={colors.textMuted}
//           value={messageInput}
//           onChangeText={setMessageInput}
//           multiline
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
//           <Send size={20} color={colors.surface} strokeWidth={2} />
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: spacing.lg,
//     paddingVertical: spacing.md,
//     backgroundColor: colors.surface,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
//   backButton: {
//     padding: spacing.sm,
//   },
//   headerTitle: {
//     ...typography.h3,
//     color: colors.text,
//   },
//   messagesContainer: {
//     flex: 1,
//   },
//   messagesContent: {
//     padding: spacing.lg,
//   },
//   messageWrapper: {
//     marginBottom: spacing.md,
//   },
//   userMessageWrapper: {
//     alignItems: 'flex-end',
//   },
//   aiMessageWrapper: {
//     alignItems: 'flex-start',
//   },
//   messageBubble: {
//     maxWidth: '80%',
//     borderRadius: borderRadius.md,
//     padding: spacing.md,
//     ...shadows.small,
//   },
//   userMessage: {
//     backgroundColor: colors.primary,
//   },
//   aiMessage: {
//     backgroundColor: colors.surface,
//   },
//   messageText: {
//     ...typography.body,
//     lineHeight: 22,
//   },
//   userMessageText: {
//     color: colors.surface,
//   },
//   aiMessageText: {
//     color: colors.text,
//   },
//   messageImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: borderRadius.sm,
//     marginBottom: spacing.sm,
//   },
//   processingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: spacing.md,
//   },
//   processingText: {
//     ...typography.bodySmall,
//     color: colors.textLight,
//     marginLeft: spacing.sm,
//   },
//   actionsContainer: {
//     marginTop: spacing.md,
//   },
//   routineButton: {
//     backgroundColor: colors.secondary,
//     borderRadius: borderRadius.md,
//     padding: spacing.md,
//     alignItems: 'center',
//     ...shadows.medium,
//     marginBottom: spacing.lg,
//   },
//   routineButtonCreated: {
//     backgroundColor: colors.primary,
//   },
//   routineButtonText: {
//     ...typography.button,
//     color: colors.surface,
//   },
//   productsContainer: {
//     backgroundColor: colors.surface,
//     borderRadius: borderRadius.md,
//     padding: spacing.md,
//     ...shadows.small,
//   },
//   productsTitle: {
//     ...typography.h3,
//     color: colors.text,
//     marginBottom: spacing.md,
//   },
//   productCard: {
//     flexDirection: 'row',
//     marginBottom: spacing.md,
//   },
//   productImage: {
//     width: 60,
//     height: 60,
//     borderRadius: borderRadius.sm,
//     backgroundColor: colors.border,
//   },
//   productInfo: {
//     flex: 1,
//     marginLeft: spacing.md,
//     justifyContent: 'center',
//   },
//   productName: {
//     ...typography.body,
//     color: colors.text,
//     marginBottom: spacing.xs,
//   },
//   productPrice: {
//     ...typography.bodySmall,
//     color: colors.primary,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: spacing.md,
//     backgroundColor: colors.surface,
//     borderTopWidth: 1,
//     borderTopColor: colors.border,
//   },
//   cameraButton: {
//     padding: spacing.sm,
//     marginRight: spacing.sm,
//   },
//   input: {
//     flex: 1,
//     backgroundColor: colors.card,
//     borderRadius: borderRadius.md,
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.sm,
//     ...typography.body,
//     color: colors.text,
//     maxHeight: 100,
//   },
//   sendButton: {
//     backgroundColor: colors.primary,
//     borderRadius: borderRadius.full,
//     padding: spacing.sm,
//     marginLeft: spacing.sm,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 40,
//     height: 40,
//   },
// });

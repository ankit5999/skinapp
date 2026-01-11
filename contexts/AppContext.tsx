// import React, { createContext, useContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Chat, Routine, CartItem, Notification, Message, RoutineTask } from '../types';
// import { diseases } from '../constants/dummyData';

// interface AppContextType {
//   chats: Chat[];
//   routines: Routine[];
//   cart: CartItem[];
//   notifications: Notification[];
//   addChat: (chat: Chat) => void;
//   updateChat: (chatId: string, updates: Partial<Chat>) => void;
//   addMessageToChat: (chatId: string, message: Message) => void;
//   createRoutineFromChat: (chatId: string) => void;
//   addToCart: (productId: string) => void;
//   removeFromCart: (productId: string) => void;
//   updateCartQuantity: (productId: string, quantity: number) => void;
//   clearCart: () => void;
//   updateRoutineTask: (routineId: string, taskId: string, completed: boolean) => void;
//   markNotificationRead: (notificationId: string) => void;
//   addNotification: (notification: Omit<Notification, 'id'>) => void;
// }

// const AppContext = createContext<AppContextType | undefined>(undefined);

// export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [routines, setRoutines] = useState<Routine[]>([]);
//   const [cart, setCart] = useState<CartItem[]>([]);
//   const [notifications, setNotifications] = useState<Notification[]>([]);

//   useEffect(() => {
//     loadData();
//   }, []);

//   useEffect(() => {
//     saveData();
//   }, [chats, routines, cart, notifications]);

//   const loadData = async () => {
//     try {
//       const [chatsData, routinesData, cartData, notificationsData] = await Promise.all([
//         AsyncStorage.getItem('chats'),
//         AsyncStorage.getItem('routines'),
//         AsyncStorage.getItem('cart'),
//         AsyncStorage.getItem('notifications'),
//       ]);

//       if (chatsData) setChats(JSON.parse(chatsData));
//       if (routinesData) setRoutines(JSON.parse(routinesData));
//       if (cartData) setCart(JSON.parse(cartData));

//       if (notificationsData) {
//         setNotifications(JSON.parse(notificationsData));
//       } else {
//         const initialNotifications: Notification[] = [
//           {
//             id: 'notif-welcome',
//             title: 'Welcome to SkinHealth!',
//             message: 'Your account has been created successfully. Start your skincare journey today!',
//             date: new Date().toISOString(),
//             read: false,
//             type: 'account',
//           },
//         ];
//         setNotifications(initialNotifications);
//       }
//     } catch (error) {
//       console.error('Error loading data:', error);
//     }
//   };

//   const saveData = async () => {
//     try {
//       await Promise.all([
//         AsyncStorage.setItem('chats', JSON.stringify(chats)),
//         AsyncStorage.setItem('routines', JSON.stringify(routines)),
//         AsyncStorage.setItem('cart', JSON.stringify(cart)),
//         AsyncStorage.setItem('notifications', JSON.stringify(notifications)),
//       ]);
//     } catch (error) {
//       console.error('Error saving data:', error);
//     }
//   };

//   const addChat = (chat: Chat) => {
//     setChats((prev) => [chat, ...prev]);
//   };

//   const updateChat = (chatId: string, updates: Partial<Chat>) => {
//     setChats((prev) =>
//       prev.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat))
//     );
//   };

//   const addMessageToChat = (chatId: string, message: Message) => {
//     setChats((prev) =>
//       prev.map((chat) =>
//         chat.id === chatId
//           ? { ...chat, messages: [...chat.messages, message] }
//           : chat
//       )
//     );
//   };

//   const createRoutineFromChat = (chatId: string) => {
//     const chat = chats.find((c) => c.id === chatId);
//     if (!chat || !chat.diseaseId) return;

//     const disease = diseases.find((d) => d.id === chat.diseaseId);
//     if (!disease) return;

//     const totalDays = 7;
//     const totalTasks = disease.routineTasks.length;
//     const tasksPerDay = Math.ceil(totalTasks / totalDays);

//     const tasks: RoutineTask[] = disease.routineTasks.map((task, index) => ({
//       id: `task-${Date.now()}-${index}`,
//       title: task,
//       completed: false,
//       day: Math.min(Math.floor(index / tasksPerDay) + 1, totalDays),
//     }));

//     const routine: Routine = {
//       id: `routine-${Date.now()}`,
//       name: disease.name,
//       description: disease.description,
//       diseaseId: disease.id,
//       startDate: new Date().toISOString(),
//       tasks,
//       chatId,
//     };

//     setRoutines((prev) => [routine, ...prev]);
//     updateChat(chatId, { routineCreated: true });

//     addNotification({
//       title: 'Routine Created',
//       message: `Your ${disease.name} skincare routine has been created successfully!`,
//       date: new Date().toISOString(),
//       read: false,
//       type: 'routine',
//     });
//   };

//   const addToCart = (productId: string) => {
//     setCart((prev) => {
//       const existing = prev.find((item) => item.productId === productId);
//       if (existing) {
//         return prev.map((item) =>
//           item.productId === productId
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prev, { productId, quantity: 1 }];
//     });
//   };

//   const removeFromCart = (productId: string) => {
//     setCart((prev) => prev.filter((item) => item.productId !== productId));
//   };

//   const updateCartQuantity = (productId: string, quantity: number) => {
//     if (quantity <= 0) {
//       removeFromCart(productId);
//       return;
//     }
//     setCart((prev) =>
//       prev.map((item) =>
//         item.productId === productId ? { ...item, quantity } : item
//       )
//     );
//   };

//   const clearCart = () => {
//     setCart([]);
//   };

//   const updateRoutineTask = (routineId: string, taskId: string, completed: boolean) => {
//     setRoutines((prev) =>
//       prev.map((routine) =>
//         routine.id === routineId
//           ? {
//               ...routine,
//               tasks: routine.tasks.map((task) =>
//                 task.id === taskId ? { ...task, completed } : task
//               ),
//             }
//           : routine
//       )
//     );
//   };

//   const markNotificationRead = (notificationId: string) => {
//     setNotifications((prev) =>
//       prev.map((notif) =>
//         notif.id === notificationId ? { ...notif, read: true } : notif
//       )
//     );
//   };

//   const addNotification = (notification: Omit<Notification, 'id'>) => {
//     const newNotification: Notification = {
//       ...notification,
//       id: `notif-${Date.now()}`,
//     };
//     setNotifications((prev) => [newNotification, ...prev]);
//   };

//   return (
//     <AppContext.Provider
//       value={{
//         chats,
//         routines,
//         cart,
//         notifications,
//         addChat,
//         updateChat,
//         addMessageToChat,
//         createRoutineFromChat,
//         addToCart,
//         removeFromCart,
//         updateCartQuantity,
//         clearCart,
//         updateRoutineTask,
//         markNotificationRead,
//         addNotification,
//       }}
//     >
//       {children}
//     </AppContext.Provider>
//   );
// };

// export const useApp = () => {
//   const context = useContext(AppContext);
//   if (context === undefined) {
//     throw new Error('useApp must be used within an AppProvider');
//   }
//   return context;
// };



import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Routine, CartItem, Notification, Message, RoutineTask } from '../types';
import { diseases } from '../constants/dummyData';

interface AppContextType {
  chats: Chat[];
  routines: Routine[];
  cart: CartItem[];
  notifications: Notification[];
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  addMessageToChat: (chatId: string, message: Message) => void;
  deleteChat: (chatId: string) => void;
  createRoutineFromChat: (chatId: string) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  updateRoutineTask: (routineId: string, taskId: string, completed: boolean) => void;
  markNotificationRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [chats, routines, cart, notifications]);

  const loadData = async () => {
    try {
      const [chatsData, routinesData, cartData, notificationsData] = await Promise.all([
        AsyncStorage.getItem('chats'),
        AsyncStorage.getItem('routines'),
        AsyncStorage.getItem('cart'),
        AsyncStorage.getItem('notifications'),
      ]);

      if (chatsData) setChats(JSON.parse(chatsData));
      if (routinesData) setRoutines(JSON.parse(routinesData));
      if (cartData) setCart(JSON.parse(cartData));

      if (notificationsData) {
        setNotifications(JSON.parse(notificationsData));
      } else {
        const initialNotifications: Notification[] = [
          {
            id: 'notif-welcome',
            title: 'Welcome to SkinHealth!',
            message: 'Your account has been created successfully. Start your skincare journey today!',
            date: new Date().toISOString(),
            read: false,
            type: 'account',
          },
        ];
        setNotifications(initialNotifications);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('chats', JSON.stringify(chats)),
        AsyncStorage.setItem('routines', JSON.stringify(routines)),
        AsyncStorage.setItem('cart', JSON.stringify(cart)),
        AsyncStorage.setItem('notifications', JSON.stringify(notifications)),
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addChat = (chat: Chat) => {
    setChats((prev) => [chat, ...prev]);
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat))
    );
  };

  const addMessageToChat = (chatId: string, message: Message) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, message] }
          : chat
      )
    );
  };

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    const routinesToDelete = routines.filter((r) => r.chatId === chatId);
    if (routinesToDelete.length > 0) {
      setRoutines((prev) => prev.filter((r) => r.chatId !== chatId));
    }

    addNotification({
      title: 'Chat Deleted',
      message: 'Your consultation has been deleted successfully.',
      date: new Date().toISOString(),
      read: false,
      type: 'account',
    });
  };

  const createRoutineFromChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat || !chat.diseaseId) return;

    const disease = diseases.find((d) => d.id === chat.diseaseId);
    if (!disease) return;

    const totalDays = 7;
    const totalTasks = disease.routineTasks.length;
    const tasksPerDay = Math.ceil(totalTasks / totalDays);

    const tasks: RoutineTask[] = disease.routineTasks.map((task, index) => ({
      id: `task-${Date.now()}-${index}`,
      title: task,
      completed: false,
      day: Math.min(Math.floor(index / tasksPerDay) + 1, totalDays),
    }));

    const routine: Routine = {
      id: `routine-${Date.now()}`,
      name: disease.name,
      description: disease.description,
      diseaseId: disease.id,
      startDate: new Date().toISOString(),
      tasks,
      chatId,
    };

    setRoutines((prev) => [routine, ...prev]);
    updateChat(chatId, { routineCreated: true });

    addNotification({
      title: 'Routine Created',
      message: `Your ${disease.name} skincare routine has been created successfully!`,
      date: new Date().toISOString(),
      read: false,
      type: 'routine',
    });
  };

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateRoutineTask = (routineId: string, taskId: string, completed: boolean) => {
    setRoutines((prev) =>
      prev.map((routine) =>
        routine.id === routineId
          ? {
              ...routine,
              tasks: routine.tasks.map((task) =>
                task.id === taskId ? { ...task, completed } : task
              ),
            }
          : routine
      )
    );
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // const addNotification = (notification: Omit<Notification, 'id'>) => {
  //   const newNotification: Notification = {
  //     ...notification,
  //     id: `notif-${Date.now()}`,
  //   };
  //   setNotifications((prev) => [newNotification, ...prev]);
  // };
const MAX_NOTIFICATIONS = 10;

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}`,
  };

  setNotifications((prev) => [
    newNotification,
    ...prev.slice(0, MAX_NOTIFICATIONS - 1),
  ]);
};

  return (
    <AppContext.Provider
      value={{
        chats,
        routines,
        cart,
        notifications,
        addChat,
        updateChat,
        addMessageToChat,
        deleteChat,
        createRoutineFromChat,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        updateRoutineTask,
        markNotificationRead,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

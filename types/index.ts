export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Chat {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  messages: Message[];
  diseaseId?: string;
  routineCreated: boolean;
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  image?: string;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  diseaseId: string;
  startDate: string;
  tasks: RoutineTask[];
  chatId: string;
}

export interface RoutineTask {
  id: string;
  title: string;
  completed: boolean;
  day: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'account' | 'routine' | 'purchase';
}

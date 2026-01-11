import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Supabase config:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const adminStatus = await AsyncStorage.getItem('isAdmin');

      if (userData) {
        setUser(JSON.parse(userData));
        setIsAdmin(adminStatus === 'true');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{ name, email, password }])
        .select()
        .single();

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting login for', email);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      console.log('AuthContext: Supabase response', { data: !!data, error });

      if (error) {
        console.error('AuthContext: Supabase error', error);
        throw error;
      }
      if (!data) {
        console.log('AuthContext: No user found');
        throw new Error('Invalid email or password');
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        created_at: data.created_at,
      };

      const adminCheck = email === 'admin@skinhealth.com' && password === 'SkinHealthAdmin2024!';
      console.log('AuthContext: Admin check', adminCheck);

      setUser(userData);
      setIsAdmin(adminCheck);

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('isAdmin', String(adminCheck));

      console.log('AuthContext: Login complete', { user: userData.email, isAdmin: adminCheck });
    } catch (error: any) {
      console.error('AuthContext: Login error', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Starting logout');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAdmin');
      setUser(null);
      setIsAdmin(false);
      console.log('AuthContext: Logout completed successfully');
    } catch (error) {
      console.error('AuthContext: Error logging out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

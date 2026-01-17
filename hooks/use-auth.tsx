"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await account.createEmailPasswordSession(email, pass);
      const user = await account.get();
      setUser(user);
      router.refresh(); // Sync middleware
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      await account.create("unique()", email, pass, name);
      await account.createEmailPasswordSession(email, pass);
      const user = await account.get();
      setUser(user);
      router.refresh(); // Sync middleware
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await account.deleteSession("current");
      setUser(null);
      router.refresh();
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, checkUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

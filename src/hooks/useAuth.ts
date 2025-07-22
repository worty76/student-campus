import { useEffect, useState } from "react";
import { logout as authLogout } from "@/utils/auth";

interface User {
  _id: string;
  username: string;
  email: string;
  Faculty: string;
  Major: string;
  Year: string;
  role: string;
  friends: string[];
  createtime: string;
  avatar_link: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userdata");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userdata");
      }
    }

    setIsLoading(false);
  }, []);

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return {
    user,
    isAdmin,
    isAuthenticated,
    isLoading,
    logout,
  };
}

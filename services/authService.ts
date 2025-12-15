import { User, UserRole } from "../types";

const USERS_STORAGE_KEY = 'solopreneur_users';
const CURRENT_USER_KEY = 'solopreneur_current_user';

// Initial Seed Data
const INITIAL_USERS: User[] = [
  {
    email: 'admin-automation@ebook.com',
    password: 'password123',
    role: UserRole.ADMIN
  },
  {
    email: 'user-automation@ebook.com',
    password: 'password123',
    role: UserRole.USER
  }
];

// Initialize users in localStorage if not exists
const initializeUsers = () => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  }
};

initializeUsers();

export const authService = {
  login: (email: string, password: string): User | null => {
    initializeUsers(); // Ensure data exists
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const user = users.find((u: User) => u.email === email && u.password === password);
    
    if (user) {
      // Return user without password
      const { password, ...safeUser } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
      return safeUser as User;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Admin Methods
  getAllUsers: (): User[] => {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    return users.map(({ password, ...u }: User) => u); // Return without passwords
  },

  addUser: (user: User) => {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    if (users.find((u: User) => u.email === user.email)) {
      throw new Error("อีเมลนี้มีอยู่ในระบบแล้ว");
    }
    users.push(user);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  deleteUser: (email: string) => {
    let users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    // Prevent deleting the main admin
    if (email === 'admin-automation@ebook.com') {
      throw new Error("ไม่สามารถลบผู้ดูแลระบบหลักได้");
    }
    users = users.filter((u: User) => u.email !== email);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
};
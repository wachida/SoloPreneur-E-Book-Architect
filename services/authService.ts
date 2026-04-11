import { User, UserRole } from "../types";

const USERS_STORAGE_KEY = 'solopreneur_users';
const CURRENT_USER_KEY = 'solopreneur_current_user';

// Initial Seed Data
const INITIAL_USERS: User[] = [
  {
    email: 'admin-automation@ebook.com',
    password: 'password123',
    role: UserRole.ADMIN,
    plan: 'PRO_YEARLY'
  },
  {
    email: 'user-automation@ebook.com',
    password: 'password123',
    role: UserRole.USER,
    plan: 'FREE'
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

  // Simulate upgrading user plan (In real app, this happens via Stripe Webhook)
  upgradeUserPlan: (email: string, plan: 'PRO_MONTHLY' | 'PRO_YEARLY') => {
    const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
    const updatedUsers = users.map((u: User) => {
        if (u.email === email) {
            return { ...u, plan: plan, subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() };
        }
        return u;
    });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    
    // Update current session if it's the same user
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
    if (currentUser.email === email) {
        currentUser.plan = plan;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
    
    return currentUser;
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
    // Default new users to FREE
    const newUser = { ...user, plan: 'FREE' };
    users.push(newUser);
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
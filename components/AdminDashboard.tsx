import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, UserRole } from '../types';
import { UserPlusIcon, TrashIcon, UserIcon, ShieldCheckIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/solid';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(authService.getAllUsers());
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      authService.addUser({
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      });
      setNewUserEmail('');
      setNewUserPassword('');
      setError('');
      loadUsers();
      alert('เพิ่มผู้ใช้งานสำเร็จ');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteUser = (email: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ ${email}?`)) {
      try {
        authService.deleteUser(email);
        loadUsers();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add User Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-200 sticky top-24">
            <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2 font-promt">
              <UserPlusIcon className="w-6 h-6 text-purple-600" /> เพิ่มผู้ใช้งานใหม่
            </h2>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">อีเมล</label>
                <div className="relative">
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full pl-9 px-3 py-2 border-2 border-stone-100 rounded-xl focus:border-purple-500 outline-none text-sm"
                    placeholder="email@example.com"
                  />
                  <EnvelopeIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">รหัสผ่านเริ่มต้น</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full pl-9 px-3 py-2 border-2 border-stone-100 rounded-xl focus:border-purple-500 outline-none text-sm font-mono"
                    placeholder="password123"
                  />
                  <KeyIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1 uppercase">สิทธิ์การใช้งาน</label>
                <div className="flex bg-stone-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewUserRole(UserRole.USER)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${newUserRole === UserRole.USER ? 'bg-white shadow-sm text-purple-700' : 'text-stone-500'}`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewUserRole(UserRole.ADMIN)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${newUserRole === UserRole.ADMIN ? 'bg-white shadow-sm text-purple-700' : 'text-stone-500'}`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <UserPlusIcon className="w-5 h-5" /> สร้างบัญชี
              </button>
            </form>
          </div>
        </div>

        {/* User List */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-3xl shadow-lg border border-stone-200 overflow-hidden">
             <div className="p-6 border-b border-stone-100 bg-purple-50 flex justify-between items-center">
               <h2 className="text-xl font-bold text-stone-800 font-promt">รายชื่อผู้ใช้งานในระบบ</h2>
               <span className="text-xs bg-white px-3 py-1 rounded-full border border-stone-200 text-stone-500">
                 ทั้งหมด {users.length} บัญชี
               </span>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="text-xs text-stone-400 border-b border-stone-100">
                     <th className="px-6 py-4 font-bold uppercase tracking-wider">User Info</th>
                     <th className="px-6 py-4 font-bold uppercase tracking-wider">Role</th>
                     <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-stone-50">
                   {users.map((user) => (
                     <tr key={user.email} className="hover:bg-purple-50/50 transition-colors">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-600' : 'bg-stone-100 text-stone-500'}`}>
                             {user.role === UserRole.ADMIN ? <ShieldCheckIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                           </div>
                           <div>
                             <div className="font-medium text-stone-700">{user.email}</div>
                             {user.role === UserRole.ADMIN && user.email.includes('automation') && (
                                <div className="text-[10px] text-purple-500">System Admin</div>
                             )}
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                           user.role === UserRole.ADMIN 
                             ? 'bg-purple-100 text-purple-800' 
                             : 'bg-green-100 text-green-800'
                         }`}>
                           {user.role}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <button
                           onClick={() => handleDeleteUser(user.email)}
                           disabled={user.email === 'admin-automation@ebook.com'}
                           className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                           title="ลบผู้ใช้"
                         >
                           <TrashIcon className="w-5 h-5" />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
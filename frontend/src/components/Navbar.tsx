import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PasswordChangeModal } from './PasswordChangeModal';
import { Store, LogOut, KeyRound, User as UserIcon, Shield, Store as StoreIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3" /> System Admin
          </span>
        );
      case 'STORE_OWNER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <StoreIcon className="w-3 h-3" /> Store Owner
          </span>
        );
      case 'USER':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <UserIcon className="w-3 h-3" /> Normal User
          </span>
        );
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-xl shadow-xs">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  Store<span className="text-indigo-600">Rate</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-400">
                  Rating Platform
                </span>
              </div>
            </div>

            {/* Right section: user info & actions */}
            {user && (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px]" title={user.name}>
                      {user.name}
                    </span>
                    {getRoleBadge(user.role)}
                  </div>
                  <span className="text-xs text-slate-500 truncate max-w-[200px]" title={user.email}>
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="Change Password"
                  >
                    <KeyRound className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Change Password</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};

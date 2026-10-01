import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { RatingStars } from '../components/RatingStars';
import api from '../api/client';
import {
  Users,
  Store,
  Star,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from '../utils/validators';

interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

interface StoreItem {
  id: string;
  name: string;
  email: string;
  address: string;
  rating: number;
  totalRatings: number;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
  rating?: number | null;
  storeName?: string | null;
  createdAt?: string;
}

interface StoreOwnerOption {
  id: string;
  name: string;
  email: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [activeTab, setActiveTab] = useState<'stores' | 'users'>('stores');
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [storeOwners, setStoreOwners] = useState<StoreOwnerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Store filters & sorting
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortField, setStoreSortField] = useState<'name' | 'email' | 'address' | 'rating'>('name');
  const [storeSortOrder, setStoreSortOrder] = useState<'asc' | 'desc'>('asc');

  // User filters & sorting
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSortField, setUserSortField] = useState<'name' | 'email' | 'address' | 'role' | 'rating'>('name');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserItem | null>(null);

  // Form states - Add Store
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreEmail, setNewStoreEmail] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStoreOwnerId, setNewStoreOwnerId] = useState('');
  const [storeFormError, setStoreFormError] = useState<string | null>(null);
  const [isSavingStore, setIsSavingStore] = useState(false);

  // Form states - Add User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'USER' | 'STORE_OWNER'>('USER');
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Alert feedback
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, storesRes, usersRes, ownersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/stores'),
        api.get('/admin/users'),
        api.get('/admin/store-owners'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (storesRes.data?.success) setStores(storesRes.data.stores);
      if (usersRes.data?.success) setUsers(usersRes.data.users);
      if (ownersRes.data?.success) setStoreOwners(ownersRes.data.owners);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSortStore = (field: 'name' | 'email' | 'address' | 'rating') => {
    if (storeSortField === field) {
      setStoreSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setStoreSortField(field);
      setStoreSortOrder('asc');
    }
  };

  const handleSortUser = (field: 'name' | 'email' | 'address' | 'role' | 'rating') => {
    if (userSortField === field) {
      setUserSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setUserSortField(field);
      setUserSortOrder('asc');
    }
  };

  // Filtered & Sorted Stores
  const filteredStores = useMemo(() => {
    return stores
      .filter((store) => {
        const query = storeSearch.toLowerCase();
        return (
          store.name.toLowerCase().includes(query) ||
          store.email.toLowerCase().includes(query) ||
          store.address.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        let valA: any = a[storeSortField];
        let valB: any = b[storeSortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
          return storeSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number') {
          return storeSortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
  }, [stores, storeSearch, storeSortField, storeSortOrder]);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const query = userSearch.toLowerCase();
        const matchesQuery =
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.address.toLowerCase().includes(query);

        const matchesRole =
          userRoleFilter === 'ALL' ? true : u.role === userRoleFilter;

        return matchesQuery && matchesRole;
      })
      .sort((a, b) => {
        let valA: any = a[userSortField];
        let valB: any = b[userSortField];

        if (valA === null || valA === undefined) return storeSortOrder === 'asc' ? 1 : -1;
        if (valB === null || valB === undefined) return storeSortOrder === 'asc' ? -1 : 1;

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
          return userSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number') {
          return userSortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
  }, [users, userSearch, userRoleFilter, userSortField, userSortOrder]);

  // Handle Add Store Submit
  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreFormError(null);

    const nameVal = validateName(newStoreName);
    if (!nameVal.isValid) {
      setStoreFormError(`Store Name: ${nameVal.message}`);
      return;
    }

    const emailVal = validateEmail(newStoreEmail);
    if (!emailVal.isValid) {
      setStoreFormError(`Store Email: ${emailVal.message}`);
      return;
    }

    const addressVal = validateAddress(newStoreAddress);
    if (!addressVal.isValid) {
      setStoreFormError(`Store Address: ${addressVal.message}`);
      return;
    }

    setIsSavingStore(true);
    try {
      const res = await api.post('/admin/stores', {
        name: newStoreName.trim(),
        email: newStoreEmail.trim(),
        address: newStoreAddress.trim(),
        ownerId: newStoreOwnerId || null,
      });

      if (res.data?.success) {
        setIsAddStoreOpen(false);
        setNewStoreName('');
        setNewStoreEmail('');
        setNewStoreAddress('');
        setNewStoreOwnerId('');
        setBannerSuccess('Store added successfully!');
        fetchDashboardData();
        setTimeout(() => setBannerSuccess(null), 4000);
      }
    } catch (err: any) {
      setStoreFormError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setIsSavingStore(false);
    }
  };

  // Handle Add User Submit
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);

    const nameVal = validateName(newUserName);
    if (!nameVal.isValid) {
      setUserFormError(`Name: ${nameVal.message}`);
      return;
    }

    const emailVal = validateEmail(newUserEmail);
    if (!emailVal.isValid) {
      setUserFormError(`Email: ${emailVal.message}`);
      return;
    }

    const addressVal = validateAddress(newUserAddress);
    if (!addressVal.isValid) {
      setUserFormError(`Address: ${addressVal.message}`);
      return;
    }

    const passVal = validatePassword(newUserPassword);
    if (!passVal.isValid) {
      setUserFormError(`Password: ${passVal.message}`);
      return;
    }

    setIsSavingUser(true);
    try {
      const res = await api.post('/admin/users', {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        address: newUserAddress.trim(),
        password: newUserPassword,
        role: newUserRole,
      });

      if (res.data?.success) {
        setIsAddUserOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        setNewUserAddress('');
        setNewUserPassword('');
        setNewUserRole('USER');
        setBannerSuccess('User created successfully!');
        fetchDashboardData();
        setTimeout(() => setBannerSuccess(null), 4000);
      }
    } catch (err: any) {
      setUserFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSavingUser(false);
    }
  };

  const renderSortIcon = (field: string, currentField: string, order: 'asc' | 'desc') => {
    if (field !== currentField) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 inline ml-1" />;
    }
    return order === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 inline ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Success */}
        {bannerSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-sm">{bannerSuccess}</span>
            </div>
            <button
              onClick={() => setBannerSuccess(null)}
              className="text-emerald-500 hover:text-emerald-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Title & Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administrator Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              System overview, store directory, and user access management
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddStoreOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Store</span>
            </button>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Users
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.totalUsers}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Stores
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.totalStores}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
              <Star className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Submitted Ratings
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.totalRatings}
              </h3>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-4">
            <button
              onClick={() => setActiveTab('stores')}
              className={`pb-4 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'stores'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Registered Stores ({stores.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-4 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Platform Users ({users.length})</span>
            </button>
          </div>

          {/* TAB 1: STORES */}
          {activeTab === 'stores' && (
            <div className="p-6">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    placeholder="Filter stores by Name, Email, or Address..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
                  Showing {filteredStores.length} of {stores.length} stores
                </div>
              </div>

              {/* Stores Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th
                        onClick={() => handleSortStore('name')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group"
                      >
                        Store Name {renderSortIcon('name', storeSortField, storeSortOrder)}
                      </th>
                      <th
                        onClick={() => handleSortStore('email')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group"
                      >
                        Email {renderSortIcon('email', storeSortField, storeSortOrder)}
                      </th>
                      <th
                        onClick={() => handleSortStore('address')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group"
                      >
                        Address {renderSortIcon('address', storeSortField, storeSortOrder)}
                      </th>
                      <th
                        onClick={() => handleSortStore('rating')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group text-center"
                      >
                        Overall Rating {renderSortIcon('rating', storeSortField, storeSortOrder)}
                      </th>
                      <th className="py-3.5 px-4">Store Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <div className="flex justify-center items-center gap-2">
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <span>Loading stores...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredStores.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No stores matching your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStores.map((store) => (
                        <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[220px]">
                            {store.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{store.email}</td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-[280px] truncate" title={store.address}>
                            {store.address}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <RatingStars
                              value={store.rating}
                              showNumber
                              totalRatings={store.totalRatings}
                              size="sm"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            {store.owner ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {store.owner.name}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Unassigned</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="p-6">
              {/* Search & Role Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Filter users by Name, Email, Address..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="ADMIN">System Admins</option>
                      <option value="USER">Normal Users</option>
                      <option value="STORE_OWNER">Store Owners</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium self-end sm:self-center">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th
                        onClick={() => handleSortUser('name')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group"
                      >
                        Name {renderSortIcon('name', userSortField, userSortOrder)}
                      </th>
                      <th
                        onClick={() => handleSortUser('email')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group"
                      >
                        Email {renderSortIcon('email', userSortField, userSortOrder)}
                      </th>
                      <th
                        onClick={() => handleSortUser('address')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group"
                      >
                        Address {renderSortIcon('address', userSortField, userSortOrder)}
                      </th>
                      <th
                        onClick={() => handleSortUser('role')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group"
                      >
                        Role {renderSortIcon('role', userSortField, userSortOrder)}
                      </th>
                      <th
                        onClick={() => handleSortUser('rating')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group text-center"
                      >
                        Rating (Store Owners) {renderSortIcon('rating', userSortField, userSortOrder)}
                      </th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <div className="flex justify-center items-center gap-2">
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <span>Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No users matching your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-[200px]">
                            {u.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-[220px] truncate" title={u.address}>
                            {u.address}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.role === 'ADMIN' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                Admin
                              </span>
                            )}
                            {u.role === 'STORE_OWNER' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Store Owner
                              </span>
                            )}
                            {u.role === 'USER' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                                Normal User
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {u.role === 'STORE_OWNER' ? (
                              u.rating !== null && u.rating !== undefined ? (
                                <RatingStars value={u.rating} showNumber size="sm" />
                              ) : (
                                <span className="text-xs text-slate-400 italic">No store assigned</span>
                              )
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => setSelectedUserDetail(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: ADD NEW STORE */}
      {isAddStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-100">
            <button
              onClick={() => setIsAddStoreOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Add New Store</h3>
                <p className="text-xs text-slate-500">Register a new store into the platform</p>
              </div>
            </div>

            {storeFormError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{storeFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Store Name
                  </label>
                  <span className="text-xs text-slate-400">
                    {newStoreName.length}/60 (min 20)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Grand Artisan Gourmet Bakery and Roastery"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Store Email
                </label>
                <input
                  type="email"
                  required
                  value={newStoreEmail}
                  onChange={(e) => setNewStoreEmail(e.target.value)}
                  placeholder="contact@grandbakery.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Store Address
                  </label>
                  <span className="text-xs text-slate-400">
                    {newStoreAddress.length}/400
                  </span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  placeholder="100 Market Square, Downtown District, Suite 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Assign Store Owner (Optional)
                </label>
                <select
                  value={newStoreOwnerId}
                  onChange={(e) => setNewStoreOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                >
                  <option value="">None (Can assign later)</option>
                  {storeOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddStoreOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStore}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer disabled:bg-indigo-300"
                >
                  {isSavingStore ? 'Saving...' : 'Add Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border border-slate-100">
            <button
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Add New User</h3>
                <p className="text-xs text-slate-500">Create an Admin, Normal User, or Store Owner</p>
              </div>
            </div>

            {userFormError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{userFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <span className="text-xs text-slate-400">
                    {newUserName.length}/60 (min 20)
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Harrison Montgomery Sterling"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="harrison.sterling@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  User Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium"
                >
                  <option value="USER">Normal User</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Address
                  </label>
                  <span className="text-xs text-slate-400">
                    {newUserAddress.length}/400
                  </span>
                </div>
                <textarea
                  rows={2}
                  required
                  value={newUserAddress}
                  onChange={(e) => setNewUserAddress(e.target.value)}
                  placeholder="505 West End Avenue, Suite 1200, New York, NY"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="8-16 chars, 1 uppercase, 1 special (e.g. Secret@1234)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-5 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-xs cursor-pointer disabled:bg-violet-300"
                >
                  {isSavingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW USER DETAILS */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-slate-100">
            <button
              onClick={() => setSelectedUserDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              User Profile Details
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Full Name
                </p>
                <p className="font-bold text-slate-800 text-base mt-0.5">
                  {selectedUserDetail.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-slate-700 mt-0.5">{selectedUserDetail.email}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role
                </p>
                <div className="mt-1">
                  {selectedUserDetail.role === 'ADMIN' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      System Administrator
                    </span>
                  )}
                  {selectedUserDetail.role === 'STORE_OWNER' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Store Owner
                    </span>
                  )}
                  {selectedUserDetail.role === 'USER' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                      Normal User
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Address
                </p>
                <p className="text-slate-700 mt-0.5 whitespace-pre-line">
                  {selectedUserDetail.address}
                </p>
              </div>

              {/* STORE OWNER SPECIFIC DETAILS */}
              {selectedUserDetail.role === 'STORE_OWNER' && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Store Information
                  </p>
                  <div>
                    <span className="text-xs text-slate-500">Associated Store: </span>
                    <span className="font-semibold text-slate-800">
                      {selectedUserDetail.storeName || 'None assigned yet'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Store Rating: </span>
                    {selectedUserDetail.rating !== null && selectedUserDetail.rating !== undefined ? (
                      <RatingStars value={selectedUserDetail.rating} showNumber size="sm" />
                    ) : (
                      <span className="text-xs text-slate-400 italic">No ratings yet</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { RatingStars } from '../components/RatingStars';
import api from '../api/client';
import {
  Store,
  Star,
  Users,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface StoreInfo {
  id: string;
  name: string;
  email: string;
  address: string;
}

interface StoreOwnerStats {
  totalRatings: number;
  averageRating: number;
  ratingBreakdown: Record<number, number>;
}

interface SubmittedRatingItem {
  ratingId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
}

export const StoreOwnerDashboard: React.FC = () => {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [stats, setStats] = useState<StoreOwnerStats | null>(null);
  const [ratings, setRatings] = useState<SubmittedRatingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Sorting
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'email' | 'rating' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDashboard = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.get('/stores/owner/dashboard');
      if (res.data?.success) {
        setStore(res.data.store);
        setStats(res.data.stats);
        setRatings(res.data.ratings);
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to load store owner dashboard data'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleSort = (field: 'name' | 'email' | 'rating' | 'date') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredRatings = useMemo(() => {
    return ratings
      .filter((r) => {
        const query = search.toLowerCase();
        return (
          r.user.name.toLowerCase().includes(query) ||
          r.user.email.toLowerCase().includes(query) ||
          r.user.address.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortField === 'name') {
          valA = a.user.name.toLowerCase();
          valB = b.user.name.toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (sortField === 'email') {
          valA = a.user.email.toLowerCase();
          valB = b.user.email.toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        if (sortField === 'rating') {
          valA = a.rating;
          valB = b.rating;
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        if (sortField === 'date') {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        return 0;
      });
  }, [ratings, search, sortField, sortOrder]);

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 inline ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex justify-center items-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-500 font-medium">Loading store dashboard...</span>
          </div>
        ) : store && stats ? (
          <>
            {/* Store Information Banner */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <Store className="w-3.5 h-3.5" /> Your Store Dashboard
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {store.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{store.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{store.address}</span>
                    </div>
                  </div>
                </div>

                {/* Big Rating Summary Card */}
                <div className="flex items-center gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 self-start md:self-auto">
                  <div className="text-center">
                    <div className="text-4xl font-black text-slate-900">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                    </div>
                    <div className="mt-1">
                      <RatingStars value={stats.averageRating} size="md" />
                    </div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                      Based on {stats.totalRatings} {stats.totalRatings === 1 ? 'rating' : 'ratings'}
                    </div>
                  </div>

                  {/* Rating Breakdown Bar Chart */}
                  <div className="w-36 space-y-1 text-xs">
                    {[5, 4, 3, 2, 1].map((starCount) => {
                      const count = stats.ratingBreakdown[starCount] || 0;
                      const percentage =
                        stats.totalRatings > 0 ? (count / stats.totalRatings) * 100 : 0;
                      return (
                        <div key={starCount} className="flex items-center gap-1.5 text-slate-500">
                          <span className="w-3 text-right font-medium">{starCount}</span>
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                          <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-4 text-slate-400 text-[10px]">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <span>Customer Ratings ({ratings.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Detailed list of users who submitted reviews for your store
                  </p>
                </div>

                <div className="relative w-full sm:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by customer name or email..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      <th
                        onClick={() => handleSort('name')}
                        className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 select-none group"
                      >
                        Customer Name {renderSortIndicator('name')}
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group"
                      >
                        Email {renderSortIndicator('email')}
                      </th>
                      <th className="py-3.5 px-4">Address</th>
                      <th
                        onClick={() => handleSort('rating')}
                        className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group text-center"
                      >
                        Rating Submitted {renderSortIndicator('rating')}
                      </th>
                      <th
                        onClick={() => handleSort('date')}
                        className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 select-none group text-right"
                      >
                        Date Submitted {renderSortIndicator('date')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredRatings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          {ratings.length === 0
                            ? 'No users have submitted ratings for your store yet.'
                            : 'No customer ratings match your search query.'}
                        </td>
                      </tr>
                    ) : (
                      filteredRatings.map((item) => (
                        <tr key={item.ratingId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {item.user.name}
                          </td>
                          <td className="py-4 px-4 text-slate-600">{item.user.email}</td>
                          <td className="py-4 px-4 text-slate-500 max-w-xs truncate" title={item.user.address}>
                            {item.user.address}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <RatingStars value={item.rating} showNumber size="sm" />
                          </td>
                          <td className="py-4 px-6 text-right text-xs text-slate-500">
                            <div className="flex items-center justify-end gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

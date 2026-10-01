import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { RatingStars } from '../components/RatingStars';
import api from '../api/client';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  MapPin,
  Mail,
  CheckCircle2,
  X,
  Sparkles,
  Edit3,
} from 'lucide-react';

interface StoreWithRating {
  id: string;
  name: string;
  email: string;
  address: string;
  overallRating: number;
  totalRatings: number;
  userRating: number | null;
  userRatingId?: string | null;
}

export const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<StoreWithRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'address' | 'overallRating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Rating Modal / Popover state
  const [activeStoreForRating, setActiveStoreForRating] = useState<StoreWithRating | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchStores = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/stores/user');
      if (res.data?.success) {
        setStores(res.data.stores);
      }
    } catch (err) {
      console.error('Failed to load stores for user', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleSort = (field: 'name' | 'address' | 'overallRating') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredStores = useMemo(() => {
    return stores
      .filter((store) => {
        const query = search.toLowerCase();
        return (
          store.name.toLowerCase().includes(query) ||
          store.address.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
  }, [stores, search, sortField, sortOrder]);

  const handleOpenRatingModal = (store: StoreWithRating) => {
    setActiveStoreForRating(store);
    setSelectedRating(store.userRating || 5);
  };

  const handleSubmitRating = async () => {
    if (!activeStoreForRating) return;

    setIsSubmittingRating(true);
    try {
      const res = await api.post(`/ratings/stores/${activeStoreForRating.id}`, {
        rating: selectedRating,
      });

      if (res.data?.success) {
        // Update local state instantly
        setStores((prev) =>
          prev.map((s) => {
            if (s.id === activeStoreForRating.id) {
              return {
                ...s,
                userRating: selectedRating,
                overallRating: res.data.storeStats.overallRating,
                totalRatings: res.data.storeStats.totalRatings,
              };
            }
            return s;
          })
        );

        setToastMessage(
          activeStoreForRating.userRating
            ? `Your rating for "${activeStoreForRating.name}" was modified to ${selectedRating} ★`
            : `Thank you! You rated "${activeStoreForRating.name}" ${selectedRating} ★`
        );
        setActiveStoreForRating(null);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 inline ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-indigo-600 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-indigo-600 inline ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-sm">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-500 hover:text-emerald-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore & Rate Stores
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse registered stores, view overall ratings, and submit or modify your personal reviews
            </p>
          </div>

          <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 px-4 py-2 rounded-xl text-indigo-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Ratings range from 1 to 5 stars</span>
          </div>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Store Name or Address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Quick Sort:
            </span>
            <button
              onClick={() => handleSort('name')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                sortField === 'name'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Name {renderSortIndicator('name')}
            </button>
            <button
              onClick={() => handleSort('address')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                sortField === 'address'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Address {renderSortIndicator('address')}
            </button>
            <button
              onClick={() => handleSort('overallRating')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                sortField === 'overallRating'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Rating {renderSortIndicator('overallRating')}
            </button>
          </div>
        </div>

        {/* Stores Table View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 select-none group"
                  >
                    Store Name {renderSortIndicator('name')}
                  </th>
                  <th
                    onClick={() => handleSort('address')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group"
                  >
                    Address {renderSortIndicator('address')}
                  </th>
                  <th
                    onClick={() => handleSort('overallRating')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 select-none group text-center"
                  >
                    Overall Rating {renderSortIndicator('overallRating')}
                  </th>
                  <th className="py-3.5 px-4 text-center">Your Submitted Rating</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
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
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No stores found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((store) => (
                    <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 max-w-xs">{store.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{store.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600 max-w-sm">
                        <div className="flex items-start gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{store.address}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <RatingStars
                          value={store.overallRating}
                          showNumber
                          totalRatings={store.totalRatings}
                          size="sm"
                        />
                      </td>

                      <td className="py-4 px-4 text-center">
                        {store.userRating !== null ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{store.userRating} / 5</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Not rated yet</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {store.userRating !== null ? (
                          <button
                            onClick={() => handleOpenRatingModal(store)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Modify Rating</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenRatingModal(store)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Rate Store</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* RATING SUBMISSION / MODIFICATION MODAL */}
      {activeStoreForRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-slate-100">
            <button
              onClick={() => setActiveStoreForRating(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {activeStoreForRating.userRating ? 'Modify Your Rating' : 'Submit Store Rating'}
                </h3>
                <p className="text-xs text-slate-500">
                  Choose a score between 1 and 5 stars
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl mb-6">
              <h4 className="font-bold text-slate-800 text-sm">{activeStoreForRating.name}</h4>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {activeStoreForRating.address}
              </p>
              {activeStoreForRating.userRating && (
                <div className="mt-2 text-xs text-slate-600">
                  Current rating:{' '}
                  <span className="font-bold text-amber-600">
                    {activeStoreForRating.userRating} ★
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center py-4 mb-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Click a star to rate:
              </span>
              <RatingStars
                value={selectedRating}
                interactive
                onChange={(newVal) => setSelectedRating(newVal)}
                size="lg"
              />
              <span className="text-lg font-extrabold text-slate-800 mt-2">
                {selectedRating} out of 5 Stars
              </span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveStoreForRating(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingRating}
                onClick={handleSubmitRating}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer disabled:bg-indigo-300"
              >
                {isSubmittingRating ? 'Saving...' : 'Save Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

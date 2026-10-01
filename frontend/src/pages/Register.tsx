import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from '../utils/validators';
import {
  UserPlus,
  User,
  Mail,
  MapPin,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const nameVal = validateName(name);
  const emailVal = validateEmail(email);
  const addressVal = validateAddress(address);
  const passVal = validatePassword(password);

  const isFormValid =
    nameVal.isValid && emailVal.isValid && addressVal.isValid && passVal.isValid;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, address: true, password: true });
    setError(null);

    if (!isFormValid) {
      setError('Please resolve all validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        password,
      });

      if (res.data?.success) {
        const { token, user } = res.data;
        login(token, user);
        navigate('/stores');
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        const messages = err.response.data.errors
          .map((e: any) => `${e.field}: ${e.message}`)
          .join(', ');
        setError(messages);
      } else {
        setError(
          err.response?.data?.message || 'Registration failed. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg mb-4">
          <UserPlus className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an Account
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign up as a normal user to review and rate registered stores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <span
                  className={`text-xs ${
                    name.length < 20 || name.length > 60
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {name.length}/60 (min 20)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Alexander Christopher Campbell"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    touched.name && !nameVal.isValid
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                      : touched.name && nameVal.isValid
                      ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
              {touched.name && !nameVal.isValid && (
                <p className="mt-1 text-xs text-rose-600">{nameVal.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="alexander@example.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    touched.email && !emailVal.isValid
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                      : touched.email && emailVal.isValid
                      ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
              {touched.email && !emailVal.isValid && (
                <p className="mt-1 text-xs text-rose-600">{emailVal.message}</p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Address
                </label>
                <span
                  className={`text-xs ${
                    address.length > 400 ? 'text-rose-600' : 'text-slate-400'
                  }`}
                >
                  {address.length}/400
                </span>
              </div>
              <div className="relative">
                <div className="absolute top-3 left-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => handleBlur('address')}
                  placeholder="Apt 4B, 742 Evergreen Terrace, Springfield"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none ${
                    touched.address && !addressVal.isValid
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                      : touched.address && addressVal.isValid
                      ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
              {touched.address && !addressVal.isValid && (
                <p className="mt-1 text-xs text-rose-600">{addressVal.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="8-16 chars, 1 uppercase, 1 special"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                    touched.password && !passVal.isValid
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                      : touched.password && passVal.isValid
                      ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500'
                  }`}
                />
              </div>
              {touched.password && !passVal.isValid && (
                <p className="mt-1 text-xs text-rose-600">{passVal.message}</p>
              )}
            </div>

            {/* Password Validation Indicators */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                {password.length >= 8 && password.length <= 16 ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 ml-1 mr-0.5" />
                )}
                <span>8 to 16 characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                {/[A-Z]/.test(password) ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 ml-1 mr-0.5" />
                )}
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className="flex items-center gap-1.5">
                {/[^a-zA-Z0-9]/.test(password) ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 ml-1 mr-0.5" />
                )}
                <span>At least one special character (!@#$%^&*...)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-indigo-300 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

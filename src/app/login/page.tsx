'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const registered = searchParams.get('registered') === 'true';

  // 認証済みの場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push(callbackUrl);
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('メールアドレスまたはパスワードが正しくありません');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-sky-100 text-sky-600 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            アカウントにログイン
          </h2>
          <p className="text-slate-600">
            または{' '}
            <Link href="/register" className="font-medium text-sky-600 hover:text-sky-700 transition-colors">
              新規登録
            </Link>
          </p>
        </motion.div>
        
        {registered && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center"
          >
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>登録が完了しました。ログインしてください。</span>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: registered ? 0.2 : 0.1 }}
          className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">
                  メールアドレス
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder-slate-400 bg-white"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-900 placeholder-slate-400 bg-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ログイン中...
                  </span>
                ) : (
                  <span className="flex items-center">
                    ログイン
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8 text-sm text-slate-500"
        >
          <p>
            ログインすることで、<Link href="/terms" className="text-sky-600 hover:text-sky-700">利用規約</Link>および
            <Link href="/privacy" className="text-sky-600 hover:text-sky-700">プライバシーポリシー</Link>に同意したことになります。
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
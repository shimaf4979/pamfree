// components/NavigationBar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Dela_Gothic_One } from 'next/font/google';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

const delaGothicOne = Dela_Gothic_One({
  subsets: ['latin'],
  weight: ['400'],
});

export default function NavigationBar() {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  
  // パスをチェックしてナビゲーションバーの表示・非表示を決定
  useEffect(() => {
    setShowNavbar(pathname !== '/login' && pathname !== '/register');
  }, [pathname]);

  // モバイルメニューが開いているときにbodyのスクロールを無効化
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // ログアウト処理
  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    router.push('/login');
  };

  // ナビゲーションバーを表示しない条件
  if (!showNavbar) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className={`${delaGothicOne.className} text-3xl font-bold text-blue-600`}>
                <Image src="/logo.svg" alt="Pamfree" width={150} height={150} />
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  ダッシュボード
                </Link>
                <Link
                  href="/account"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === '/account'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  アカウント
                </Link>
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            ) : user ? (
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex text-sm rounded-full focus:outline-none"
                  >
                    <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      {user.name || user.email}
                      <svg
                        className="-mr-1 ml-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
                {isMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dropdown-animation"
                  >
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      アカウント設定
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/users"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ユーザー管理
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 border-blue-600"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">メニューを開く</span>
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <>
          {/* 半透明の背景オーバーレイ */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden mobile-menu-overlay"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* メニューコンテンツ */}
          <div
            className="sm:hidden bg-white relative z-50 overflow-hidden mobile-menu-content"
          >
            <div className="pt-2 pb-3 space-y-1">
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      pathname === '/dashboard'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ダッシュボード
                  </Link>
                  <Link
                    href="/account"
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      pathname === '/account'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    アカウント
                  </Link>
                </>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-800 font-medium">
                          {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">
                        {user.name || '名前なし'}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      アカウント設定
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/users"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ユーザー管理
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    新規登録
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
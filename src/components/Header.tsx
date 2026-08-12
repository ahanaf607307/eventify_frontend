'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMyNotifications } from '@/hooks/useNotifications';
import { 
  Rocket, Bell, Menu, LayoutDashboard, UserCog, LogOut, ChevronDown, Calendar, Tag, ShieldAlert
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Notifications query
  const { data: notifications } = useMyNotifications();
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Don't render general header on dashboard or ticket views to preserve workspace layout
  const isDashboard = pathname.startsWith('/dashboard');
  const isTicket = pathname.startsWith('/ticket');
  if (isDashboard || isTicket) return null;

  const isHome = pathname === '/';
  const isEvents = pathname.startsWith('/events');

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl tracking-tight text-white">
          <Rocket className="w-7 h-7 text-indigo-500 fill-indigo-500/20" />
          <span>Eventify</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={`font-medium transition-colors hover:text-white ${isHome ? 'text-white' : 'text-slate-400'}`}
          >
            Home
          </Link>
          <Link 
            href="/events" 
            className={`font-medium transition-colors hover:text-white ${isEvents ? 'text-white' : 'text-slate-400'}`}
          >
            Explore Events
          </Link>
          {isLoggedIn && (
            <Link 
              href="/dashboard" 
              className={`font-medium transition-colors hover:text-white ${pathname.startsWith('/dashboard') ? 'text-white' : 'text-slate-400'}`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Auth controls */}
        <div className="flex items-center gap-4">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-4">
              {/* Notification icon */}
              <Link href="/dashboard#notifications" className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-full hover:border-indigo-500 transition-colors cursor-pointer outline-none">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
                    <AvatarFallback className="bg-indigo-500/20 text-indigo-400">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold hidden sm:inline text-white">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10 text-slate-300">
                  <div className="px-3 py-2">
                    <p className="font-bold text-sm text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                      {user.role === 'USER' ? 'Attendee' : user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer" onClick={() => router.push('/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2.5" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/5 focus:text-white cursor-pointer" onClick={() => router.push('/dashboard#profile')}>
                    <UserCog className="w-4 h-4 mr-2.5" /> Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuItem 
                    className="focus:bg-rose-500/10 focus:text-rose-400 text-rose-500 cursor-pointer"
                    onClick={() => logout()}
                  >
                    <LogOut className="w-4 h-4 mr-2.5" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-indigo-500/20 hover:shadow-lg transition-all" onClick={() => router.push('/login?tab=register')}>
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 py-4 bg-slate-950 border-b border-white/5 flex flex-col gap-4">
          <Link 
            href="/" 
            className={`font-semibold py-2 transition-colors ${isHome ? 'text-indigo-400' : 'text-slate-300'}`}
          >
            Home
          </Link>
          <Link 
            href="/events" 
            className={`font-semibold py-2 transition-colors ${isEvents ? 'text-indigo-400' : 'text-slate-300'}`}
          >
            Explore Events
          </Link>
          {isLoggedIn ? (
            <Link 
              href="/dashboard" 
              className="font-semibold py-2 text-slate-300"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-white/5">
              <Button variant="outline" className="w-full border-white/10" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button className="w-full bg-indigo-500 hover:bg-indigo-600" onClick={() => router.push('/login?tab=register')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

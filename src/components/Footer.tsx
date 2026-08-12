'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rocket } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on dashboard or ticket page
  const isDashboard = pathname.startsWith('/dashboard');
  const isTicket = pathname.startsWith('/ticket');
  if (isDashboard || isTicket) return null;

  return (
    <footer className="bg-slate-955 border-t border-white/5 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-2xl tracking-tight text-white mb-6">
              <Rocket className="w-7 h-7 text-indigo-500 fill-indigo-500/20" />
              <span>Eventify</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
              Discover and book tickets for the most popular upcoming concerts, technology conferences, sports tournaments, and webinars globally.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 hover:bg-indigo-500 hover:text-white transition-all duration-300 flex items-center justify-center text-slate-400">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 hover:bg-indigo-500 hover:text-white transition-all duration-300 flex items-center justify-center text-slate-400">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 hover:bg-indigo-500 hover:text-white transition-all duration-300 flex items-center justify-center text-slate-400">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-white/5 hover:bg-indigo-500 hover:text-white transition-all duration-300 flex items-center justify-center text-slate-400">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:w-8 after:h-0.5 after:bg-indigo-500">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-white hover:pl-1 transition-all">Home</Link></li>
              <li><Link href="/events" className="hover:text-white hover:pl-1 transition-all">Browse Events</Link></li>
              <li><Link href="/login" className="hover:text-white hover:pl-1 transition-all">Login Portal</Link></li>
              <li><Link href="/dashboard" className="hover:text-white hover:pl-1 transition-all">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:w-8 after:h-0.5 after:bg-indigo-500">
              Support
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white hover:pl-1 transition-all">Contact Support</a></li>
              <li><a href="#" className="hover:text-white hover:pl-1 transition-all">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white hover:pl-1 transition-all">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white hover:pl-1 transition-all">FAQs</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Eventify Ltd. All Rights Reserved. Built with ❤️ for outstanding events.</p>
        </div>

      </div>
    </footer>
  );
}

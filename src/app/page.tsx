'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { useCategories } from '@/hooks/useCategories';
import { useDashboardOverview } from '@/hooks/useDashboard';
import { Search, Globe, Tag, Calendar, Clock, MapPin, Ticket, UserCheck, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Queries
  const { data: statsData } = useDashboardOverview();
  const { data: categories } = useCategories();
  const { data: featuredEventsRes, isLoading: eventsLoading } = useEvents({ isFeatured: true, limit: 3 });

  const executeSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/events');
    }
  };

  const selectCategory = (slug: string) => {
    router.push(`/events?category=${encodeURIComponent(slug)}`);
  };

  const stats = statsData?.stats || {};
  const events = featuredEventsRes?.data || [];

  return (
    <div>
      {/* Hero Banner Section */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        {/* Background Image overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 bg-no-repeat"
          style={{ backgroundImage: "url('/assets/images/hero-banner.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] max-w-3xl">
            Experience More. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Live The Moment.
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Discover premium live events, interactive conferences, sports championships, and musical festivals globally. Book VIP passes in seconds.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-2xl p-2 bg-slate-900/60 border border-white/5 rounded-2xl backdrop-blur-xl flex flex-col sm:flex-row gap-2 shadow-2xl">
            <div className="flex-grow flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-slate-500" />
              <Input 
                type="text" 
                placeholder="Search by event title, keyword, location, or venue..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                className="bg-transparent border-0 text-white placeholder-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
              />
            </div>
            <Button 
              onClick={executeSearch}
              className="bg-indigo-500 hover:bg-indigo-600 px-6 py-6 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              Find Events
            </Button>
          </div>

          {/* Categories Pill Horizontal Scroll */}
          <div className="w-full max-w-3xl mt-12 flex gap-3 overflow-x-auto py-2 no-scrollbar">
            <button 
              onClick={() => router.push('/events')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-white/5 text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 rounded-full font-semibold text-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Globe className="w-4 h-4" /> All Categories
            </button>
            
            {categories?.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => selectCategory(cat.slug)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-white/5 text-slate-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 rounded-full font-semibold text-sm transition-all whitespace-nowrap cursor-pointer"
              >
                {cat.iconUrl ? (
                  <img src={cat.iconUrl} alt={cat.name} className="w-4 h-4 object-contain" />
                ) : (
                  <Tag className="w-4 h-4 text-indigo-400" />
                )}
                {cat.name}
              </button>
            ))}
          </div>

          {/* Metrics Counter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 w-full max-w-4xl mt-16 border-t border-white/5 pt-12">
            <div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                {stats.totalEvents || 25}+
              </h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Live Events</p>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                {categories?.length || 8}+
              </h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Categories</p>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                {stats.totalBookings || 1200}+
              </h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tickets Sold</p>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-1">4.9/5</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">User Rating</p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Events section */}
      <section className="py-24 bg-slate-900/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Trending Events</h2>
              <p className="text-slate-400 text-sm max-w-xl">
                Explore the most popular events and bootcamps happening this season. Secure your spot now.
              </p>
            </div>
            <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => router.push('/events')}>
              View All Events
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {eventsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="bg-slate-900/60 border-white/5 overflow-hidden flex flex-col h-[380px]">
                  <Skeleton className="h-48 w-full rounded-none bg-slate-800" />
                  <CardContent className="p-6 flex-grow flex flex-col gap-3">
                    <Skeleton className="h-4 w-1/3 bg-slate-800" />
                    <Skeleton className="h-6 w-3/4 bg-slate-800" />
                    <Skeleton className="h-4 w-1/2 mt-2 bg-slate-800" />
                  </CardContent>
                </Card>
              ))
            ) : events.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-slate-500 font-medium">
                No trending events found right now. Check back later!
              </div>
            ) : (
              events.map((evt: any) => {
                const banner = evt.bannerUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000';
                return (
                  <Card key={evt.id} className="bg-slate-900/40 border-white/5 overflow-hidden flex flex-col h-full hover:-translate-y-2 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 group">
                    <div className="relative h-48 bg-slate-800 overflow-hidden">
                      <img 
                        src={banner} 
                        alt={evt.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000'; }}
                      />
                      <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold bg-indigo-500 text-white rounded-full">
                        {evt.status}
                      </span>
                    </div>
                    <CardContent className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-pink-400 uppercase tracking-wider block mb-2">
                          {evt.category?.name || 'General'}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 h-14 group-hover:text-indigo-400 transition-colors">
                          {evt.title}
                        </h3>
                        <div className="flex flex-col gap-2.5 text-slate-400 text-sm mb-6">
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-400" /> {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> {evt.time}</div>
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-400" /> {evt.location.split(',')[0]}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="text-xl font-extrabold text-white">
                          {evt.ticketPrice > 0 ? `${new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(evt.ticketPrice)}` : 'Free Entry'}
                        </span>
                        <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer" onClick={() => router.push(`/events/${evt.id}`)}>
                          Book Pass
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">How Eventify Works</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              A seamless process designed to help you discover, purchase, and verify event tickets in absolute ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-900/20 border-white/5 p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-lg mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Discover</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Browse through dozens of curated global events, filtering by interest, price, and location.
              </p>
            </Card>
            <Card className="bg-slate-900/20 border-white/5 p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-lg mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Purchase Ticket</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Select seat counts, write organizer notes, and complete payment immediately via secure portals.
              </p>
            </Card>
            <Card className="bg-slate-900/20 border-white/5 p-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-lg mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Scan & Attend</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Download your boarding pass QR Ticket. Show it at the gate to get verified in a single flash.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

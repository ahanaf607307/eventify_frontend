'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEvents } from '@/hooks/useEvents';
import { useCategories } from '@/hooks/useCategories';
import { Calendar, Clock, MapPin, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

function EventsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search Param Initializer States
  const [search, setSearch] = useState<string>(searchParams.get('search') ?? '');
  const [category, setCategory] = useState<string>(searchParams.get('category') ?? '');
  const [priceMax, setPriceMax] = useState<number>(10000);
  const [date, setDate] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date-asc');
  const [page, setPage] = useState<number>(1);

  const limit = 6;

  // React to URL Changes
  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
    setCategory(searchParams.get('category') ?? '');
  }, [searchParams]);

  // Categories query
  const { data: categories } = useCategories();

  // Map sort filter to API format
  let sortParam = 'date';
  if (sortBy === 'date-desc') {
    sortParam = '-createdAt';
  } else if (sortBy === 'price-asc') {
    sortParam = 'ticketPrice';
  } else if (sortBy === 'price-desc') {
    sortParam = '-ticketPrice';
  }

  // API query params
  const queryParams: any = {
    page,
    limit,
    searchTerm: search.trim() || undefined,
    categoryId: category || undefined,
    status: status || undefined,
    sort: sortParam,
  };

  if (priceMax !== 10000) {
    queryParams.maxPrice = priceMax;
  }
  if (date) {
    queryParams.date = new Date(date).toISOString();
  }

  // Events query
  const { data: eventsRes, isLoading, refetch } = useEvents(queryParams);

  const applyFilters = () => {
    setPage(1);
    refetch();
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setPriceMax(10000);
    setDate('');
    setStatus('');
    setSortBy('date-asc');
    setPage(1);
    
    // Clear URL parameters
    router.push('/events');
  };

  const events = eventsRes?.data || [];
  const meta = eventsRes?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
        
        {/* Left Filters Sidebar */}
        <aside className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 h-fit sticky top-24 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-400" /> Filters
            </h3>
          </div>

          <div className="flex flex-col gap-6">
            {/* Search Keyword */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Keyword</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Title, location, venue..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-950/60 border-white/5 text-white"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event Category</label>
              <Select value={category} onValueChange={(val) => setCategory(val ?? '')}>
                <SelectTrigger className="bg-slate-955 border-white/5 text-white">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Max slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Ticket Price Max</span>
                <span className="text-indigo-400">
                  {priceMax === 10000 ? '10,000 BDT' : `${new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(priceMax)}`}
                </span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="250" 
                value={priceMax} 
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
              />
            </div>

            {/* Event Date picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event Date</label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-950/60 border-white/5 text-white"
              />
            </div>

            {/* Event Status selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event Status</label>
              <Select value={status} onValueChange={(val) => setStatus(val ?? '')}>
                <SelectTrigger className="bg-slate-955 border-white/5 text-white">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="flex flex-col gap-2.5 mt-2">
              <Button onClick={applyFilters} className="bg-indigo-500 hover:bg-indigo-600 font-semibold cursor-pointer">
                Apply Filters
              </Button>
              <Button onClick={resetFilters} variant="secondary" className="border-white/5 hover:bg-white/5 text-white cursor-pointer">
                Reset
              </Button>
            </div>

          </div>
        </aside>

        {/* Right Event Catalog grid view */}
        <main>
          {/* Header controls bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Explore Events</h2>
              <p className="text-slate-400 text-xs mt-1">
                {isLoading ? 'Searching events...' : `Showing ${events.length} events of ${meta.total || 0} found`}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm text-slate-400 whitespace-nowrap">Sort By:</span>
              <Select value={sortBy} onValueChange={(val) => { setSortBy(val ?? 'date-asc'); setPage(1); }}>
                <SelectTrigger className="w-[180px] bg-slate-900/60 border-white/5 text-white">
                  <SelectValue placeholder="Date (Upcoming)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                  <SelectItem value="date-asc">Date (Upcoming First)</SelectItem>
                  <SelectItem value="date-desc">Date (Newest Created)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid list of cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
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
              <div className="col-span-2 text-center py-20 bg-slate-900/10 border border-white/5 rounded-2xl p-6">
                <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
                <p className="text-slate-400 text-sm">Try adjusting filters or changing search keywords.</p>
              </div>
            ) : (
              events.map((evt: any) => {
                const banner = evt.bannerUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000';
                return (
                  <Card key={evt.id} className="bg-slate-900/40 border-white/5 overflow-hidden flex flex-col h-full hover:-translate-y-1.5 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 group">
                    <div className="relative h-48 bg-slate-800 overflow-hidden">
                      <img 
                        src={banner} 
                        alt={evt.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000'; }}
                      />
                      <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full ${
                        evt.status === 'UPCOMING' ? 'bg-indigo-500 text-white' : (evt.status === 'ONGOING' ? 'bg-cyan-500 text-white' : 'bg-emerald-500 text-white')
                      }`}>
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

          {/* Pagination Controls */}
          {!isLoading && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button 
                variant="secondary" 
                size="icon" 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-slate-900 border border-white/5 text-slate-400 hover:bg-indigo-500 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              {Array.from({ length: meta.totalPages }).map((_, idx) => (
                <Button 
                  key={idx}
                  variant="secondary"
                  onClick={() => setPage(idx + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold cursor-pointer ${
                    page === idx + 1 ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-500/25' : 'bg-slate-900 border border-white/5 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {idx + 1}
                </Button>
              ))}

              <Button 
                variant="secondary" 
                size="icon" 
                disabled={page === meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-slate-900 border border-white/5 text-slate-400 hover:bg-indigo-500 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default function EventsCatalog() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-slate-400">
        Loading events explorer catalog...
      </div>
    }>
      <EventsCatalogContent />
    </Suspense>
  );
}

'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBooking } from '@/hooks/useBookings';
import { useAuth } from '@/context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Printer, ShieldAlert, CheckCircle, Tag, MapPin, Calendar, Clock, Armchair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TicketDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const bookingId = params.id as string;

  // Query
  const { data: ticket, isLoading, error } = useBooking(bookingId);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-slate-400">
        <div className="loader-spinner w-10 h-10 border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p>Loading ticket pass details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-rose-500 font-bold">
        Failed to load ticket pass. Ticket does not exist or unauthorized.
      </div>
    );
  }

  const evt = (ticket.event || {}) as any;
  const isAttended = ticket.status === 'ATTENDED';
  const isCancelled = ticket.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      
      {/* Top action bar */}
      <div className="print:hidden flex justify-between items-center mb-8 gap-4 w-full">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard')}
          className="text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
        
        <Button 
          onClick={() => window.print()}
          className="bg-indigo-500 hover:bg-indigo-600 font-semibold shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          <Printer className="w-4 h-4 mr-2" /> Print Pass (PDF)
        </Button>
      </div>

      {/* VIP Boarding Pass Card */}
      <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-slate-900/60 backdrop-blur-xl grid grid-cols-1 md:grid-cols-[1fr_240px] relative">
        
        {/* Notches for ticket cutout layout */}
        <div className="absolute w-6 h-6 rounded-full bg-slate-950 -top-3 right-[228px] hidden md:block border-b border-white/5" />
        <div className="absolute w-6 h-6 rounded-full bg-slate-950 -bottom-3 right-[228px] hidden md:block border-t border-white/5" />

        {/* Left Column (Details) */}
        <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-dashed border-white/10 flex flex-col justify-between gap-8">
          <div>
            <div className="h-28 rounded-xl overflow-hidden border border-white/5 mb-6 bg-slate-950">
              <img 
                src={evt.bannerUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000'} 
                alt={evt.title} 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000'; }}
              />
            </div>

            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full mb-3">
              {evt.category?.name || 'General'}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-tight tracking-tight">
              {evt.title}
            </h2>
            <p className="text-slate-400 text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {evt.location}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-t border-white/5 pt-6">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Attendee Name</p>
              <p className="text-sm font-bold text-slate-200">{ticket.user?.name || user?.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Booking Code</p>
              <p className="text-sm font-bold text-pink-500">{ticket.bookingCode}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Date & Time</p>
              <p className="text-sm font-bold text-slate-200">
                {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} @ {evt.time}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-0.5">Seating Passes</p>
              <p className="text-sm font-bold text-slate-200">
                {ticket.seatCount} Seat{ticket.seatCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (QR Scanner area) */}
        <div className="bg-slate-950/40 p-8 flex flex-col items-center justify-center text-center">
          <p className="text-[9px] uppercase font-extrabold tracking-widest text-slate-500 mb-6">Gate Entry Pass</p>

          <div className="p-3 bg-white rounded-xl shadow-lg mb-6">
            <QRCodeCanvas 
              value={ticket.bookingCode} 
              size={140}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <Badge className={`text-xs px-4 py-1 font-bold ${
            isAttended ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : (isCancelled ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20')
          }`}>
            {isAttended ? 'CHECKED IN' : ticket.status}
          </Badge>

          <div className="mt-8 text-xs text-slate-400 flex flex-col gap-1">
            <p>Payment: <strong className={ticket.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-rose-500'}>{ticket.paymentStatus}</strong></p>
            <p className="text-[10px] text-slate-500">via {ticket.paymentMethod?.replace('_', ' ')}</p>
          </div>

          <div className="font-mono text-slate-600 text-sm tracking-widest mt-6 font-bold">
            *{ticket.bookingCode}*
          </div>
        </div>

      </div>

    </div>
  );
}

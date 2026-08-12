'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/hooks/useEvents';
import { useCreateBooking } from '@/hooks/useBookings';
import { api } from '@/lib/api';
import { 
  Calendar, Clock, MapPin, Armchair, Shirt, Wifi, Car, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReviewData {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export default function EventDetails() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  
  const eventId = params.id as string;
  
  // Queries
  const { data: evt, isLoading, error } = useEvent(eventId);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [countdownActive, setCountdownActive] = useState(false);

  // Booking Modal form state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [seatCount, setSeatCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [bookingNotes, setBookingNotes] = useState('');
  
  // Review Modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Book mutation
  const createBooking = useCreateBooking();

  // Load reviews list
  const loadReviews = async () => {
    if (!eventId) return;
    setReviewsLoading(true);
    try {
      const res = await api.get(`/reviews/event/${eventId}`);
      if (res.data && res.data.success) {
        setReviews(res.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [eventId]);

  // Countdown Timer
  useEffect(() => {
    if (!evt || !evt.date) return;

    const target = new Date(evt.date).getTime();
    
    const updateClock = () => {
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setCountdownActive(false);
        return;
      }
      
      setCountdownActive(true);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [evt]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-slate-400">
        <div className="loader-spinner w-10 h-10 border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
        <p>Loading event information...</p>
      </div>
    );
  }

  if (error || !evt) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-rose-500 font-bold">
        Failed to load event details. Event does not exist or network error.
      </div>
    );
  }

  const banner = evt.bannerUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000';
  const highlights = evt.eventHighlight || {};

  const handleBookingOpen = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setSeatCount(1);
    setPaymentMethod('CARD');
    setBookingNotes('');
    setBookingOpen(true);
  };

  const executeBooking = async () => {
    try {
      const res = await createBooking.mutateAsync({
        eventId,
        seatCount,
        paymentMethod,
        notes: bookingNotes || undefined,
      });

      if (res.success && res.data) {
        setBookingOpen(false);
        router.push(`/ticket/${res.data.id}`);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReviewOpen = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setRating(5);
    setComment('');
    setReviewOpen(true);
  };

  const submitReview = async () => {
    if (!comment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        eventId,
        rating,
        comment: comment.trim(),
      });
      if (res.data && res.data.success) {
        setReviewOpen(false);
        loadReviews();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div>
      {/* Hero Banner header */}
      <section className="relative h-[380px] bg-slate-955 flex items-end py-16 px-6 overflow-hidden">
        <img 
          src={banner} 
          alt={evt.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-955/20 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <span className="inline-block px-3 py-1 text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full mb-4">
            {evt.category?.name || 'General'}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight max-w-4xl tracking-tight">
            {evt.title}
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-slate-300 text-sm md:text-base font-semibold">
            <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500" /> {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> {evt.time}</div>
          </div>

          {/* Countdown Clock */}
          {countdownActive && (
            <div className="flex gap-3 mt-6">
              <div className="bg-slate-900/60 border border-white/5 backdrop-blur px-3 py-1.5 rounded-lg text-center min-w-[64px]">
                <div className="text-xl font-bold text-pink-400">{timeLeft.days.toString().padStart(2, '0')}</div>
                <div className="text-[9px] uppercase font-bold text-slate-400">Days</div>
              </div>
              <div className="bg-slate-900/60 border border-white/5 backdrop-blur px-3 py-1.5 rounded-lg text-center min-w-[64px]">
                <div className="text-xl font-bold text-pink-400">{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-[9px] uppercase font-bold text-slate-400">Hrs</div>
              </div>
              <div className="bg-slate-900/60 border border-white/5 backdrop-blur px-3 py-1.5 rounded-lg text-center min-w-[64px]">
                <div className="text-xl font-bold text-pink-400">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-[9px] uppercase font-bold text-slate-400">Mins</div>
              </div>
              <div className="bg-slate-900/60 border border-white/5 backdrop-blur px-3 py-1.5 rounded-lg text-center min-w-[64px]">
                <div className="text-xl font-bold text-pink-400">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-[9px] uppercase font-bold text-slate-400">Secs</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Grid details content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          
          {/* Left Panel */}
          <main className="flex flex-col gap-10">
            <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-white/5">About the Event</h2>
              <p className="text-slate-400 leading-relaxed whitespace-pre-line text-[15px] mb-8">
                {evt.description || evt.about || 'No details provided.'}
              </p>

              <h2 className="text-xl font-bold text-white mb-6 pb-3 border-b border-white/5">Highlight Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                  <Shirt className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Dress Code</p>
                    <p className="text-sm font-bold text-white">{highlights.dressCode || 'Casual'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Workshops</p>
                    <p className="text-sm font-bold text-white">{highlights.workshops || 0} Session(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                  <Wifi className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Wifi available</p>
                    <p className="text-sm font-bold text-white">{highlights.wifiAvailable ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-900/40 border border-white/5 rounded-xl">
                  <Car className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Parking Space</p>
                    <p className="text-sm font-bold text-white">{highlights.parkingFacility || 'Available'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews list */}
            <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
              <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
                <h2 className="text-xl font-bold text-white">Attendee Reviews</h2>
                <Button variant="outline" size="sm" onClick={handleReviewOpen} className="border-white/10 hover:bg-white/5 text-white cursor-pointer">
                  Write a Review
                </Button>
              </div>

              <div className="flex flex-col gap-6">
                {reviewsLoading ? (
                  <p className="text-center text-slate-500 text-sm">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-4">No reviews left yet for this event.</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="pb-6 border-b border-white/5 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm text-white">{rev.user?.name || 'Attendee'}</strong>
                          <span className="text-[11px] text-slate-500">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>

          {/* Right sticky tickets checkouts */}
          <aside>
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-8 sticky top-24 backdrop-blur-xl flex flex-col gap-6">
              
              <div>
                <p className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Ticket Price</p>
                <h3 className="text-3xl font-extrabold text-pink-500">
                  {evt.ticketPrice > 0 ? `${new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(evt.ticketPrice)}` : 'Free Entry'}
                </h3>
              </div>

              <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Venue</p>
                    <p className="text-sm font-semibold text-slate-200">{evt.location}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Armchair className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Capacity Availability</p>
                    <p className="text-sm font-semibold text-slate-200">
                      {evt.availableSeats} of {evt.seatCount} seats left
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleBookingOpen}
                disabled={evt.availableSeats <= 0 || evt.status === 'COMPLETED' || evt.status === 'CANCELLED'}
                className="w-full bg-indigo-500 hover:bg-indigo-600 font-bold py-6 rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer"
              >
                {evt.availableSeats <= 0 ? 'Fully Booked' : (evt.status === 'UPCOMING' ? 'Book Pass' : `Event ${evt.status}`)}
              </Button>

            </div>
          </aside>

        </div>
      </div>

      {/* BOOKING MODAL */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Book Seat Pass</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4">
            
            <div className="flex flex-col items-center gap-3">
              <p className="text-slate-400 text-sm text-center">Select how many seats you would like to book.</p>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                  className="w-10 h-10 rounded-full border-white/10 text-white hover:bg-white/5 cursor-pointer"
                >
                  -
                </Button>
                <span className="text-3xl font-extrabold w-12 text-center">{seatCount}</span>
                <Button 
                  variant="outline" 
                  onClick={() => setSeatCount(Math.min(evt.availableSeats, seatCount + 1))}
                  className="w-10 h-10 rounded-full border-white/10 text-white hover:bg-white/5 cursor-pointer"
                >
                  +
                </Button>
              </div>
              <p className="text-slate-500 text-xs">Available seats: {evt.availableSeats}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method</label>
              <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val ?? 'CARD')}>
                <SelectTrigger className="bg-slate-955 border-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                  <SelectItem value="CARD">Debit / Credit Card</SelectItem>
                  <SelectItem value="MOBILE_BANKING">Mobile Financial Services (bKash/Nagad)</SelectItem>
                  <SelectItem value="CASH_ON_GATE">Cash Payment on Entry Gate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Special Requirements</label>
              <textarea 
                placeholder="Food requirements, wheelchair support, etc..." 
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 min-h-[80px]"
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-950/60 border border-white/5 rounded-xl">
              <span className="font-semibold text-sm">Total Amount:</span>
              <span className="text-2xl font-extrabold text-pink-500">
                {evt.ticketPrice > 0 ? `${new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(evt.ticketPrice * seatCount)}` : 'Free Entry'}
              </span>
            </div>

          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" className="border-white/5 hover:bg-white/5 text-white cursor-pointer" onClick={() => setBookingOpen(false)}>Cancel</Button>
            <Button onClick={executeBooking} className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer">Confirm Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REVIEW WRITE MODAL */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Write Attendee Review</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6 py-4">
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Rating</label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setRating(idx + 1)}
                    className="p-1 cursor-pointer"
                  >
                    <Star className={`w-8 h-8 ${idx < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Comment</label>
              <textarea 
                placeholder="Share your experience attending this event..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 min-h-[120px]"
                required
              />
            </div>

          </div>
          <DialogFooter className="gap-2">
            <Button variant="secondary" className="border-white/5 hover:bg-white/5 text-white cursor-pointer" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button onClick={submitReview} disabled={submittingReview || !comment.trim()} className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

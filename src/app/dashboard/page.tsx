'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardOverview } from '@/hooks/useDashboard';
import { useMyBookings, useAllBookings, useCancelBooking, useVerifyTicket, useUpdateBookingStatus, useDeleteBooking } from '@/hooks/useBookings';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useMyNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useClearAllNotifications, useCreateBroadcastNotification } from '@/hooks/useNotifications';
import { useMyActivityLogs, useAllActivityLogs } from '@/hooks/useActivityLogs';
import { api } from '@/lib/api';
import { CONFIG, UserRole, EventStatus } from '@/lib/config';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Ticket, Bell, User, Camera, Calendar, Tag, ShieldCheck, 
  Users, Activity, Star, LogOut, Search, Settings, Plus, Edit, Trash, 
  Upload, CheckCircle, XCircle, Info, ShieldAlert, BadgeInfo
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardPortal() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Queries
  const { data: overviewRes, refetch: refetchOverview } = useDashboardOverview();
  const { data: myBookings, refetch: refetchMyBookings } = useMyBookings();
  const { data: allBookings, refetch: refetchAllBookings } = useAllBookings();
  const { data: eventsRes, refetch: refetchEvents } = useEvents({ limit: 100 });
  const { data: categories, refetch: refetchCategories } = useCategories();
  const { data: notifications, refetch: refetchNotifications } = useMyNotifications();
  const { data: myLogs } = useMyActivityLogs();
  const { data: allLogs } = useAllActivityLogs();

  const events = eventsRes?.data || [];
  const stats = overviewRes?.stats || {};

  // Mutations
  const cancelBooking = useCancelBooking();
  const verifyTicket = useVerifyTicket();
  const updateBookingStatus = useUpdateBookingStatus('');
  const deleteBooking = useDeleteBooking();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent('');
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory('');
  const deleteCategory = useDeleteCategory();
  const deleteEvent = useDeleteEvent();
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const clearAllNotifications = useClearAllNotifications();
  const createBroadcast = useCreateBroadcastNotification();

  // Profile Edit states
  const [profName, setProfName] = useState(user?.name || '');
  const [profEmail, setProfEmail] = useState(user?.email || '');
  const [profAvatar, setProfAvatar] = useState<File | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Verification / Scanner States
  const [scanCode, setScanCode] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const scannerRef = useRef<any>(null);

  // CRUDS Modals toggle states
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState('');
  const [evtPrice, setEvtPrice] = useState(0);
  const [evtSeats, setEvtSeats] = useState(100);
  const [evtLocation, setEvtLocation] = useState('');
  const [evtDate, setEvtDate] = useState('');
  const [evtTime, setEvtTime] = useState('');
  const [evtStatus, setEvtStatus] = useState<EventStatus>('UPCOMING');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtHighlightDress, setEvtHighlightDress] = useState('');
  const [evtHighlightWorkshops, setEvtHighlightWorkshops] = useState(0);
  const [evtHighlightWifi, setEvtHighlightWifi] = useState('false');
  const [evtHighlightParking, setEvtHighlightParking] = useState('');
  const [evtBannerFile, setEvtBannerFile] = useState<File | null>(null);

  // Category CRUD states
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIconFile, setCatIconFile] = useState<File | null>(null);

  // Broadcast Notification modal
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadTitle, setBroadTitle] = useState('');
  const [broadMessage, setBroadMessage] = useState('');
  const [broadRole, setBroadRole] = useState('ALL');

  // React to hash tags for tab routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // HTML5 QR Code Scanner Init
  useEffect(() => {
    let html5QrcodeScanner: any = null;

    if (activeTab === 'staff-scanner' && typeof window !== 'undefined') {
      import('html5-qrcode').then((module) => {
        html5QrcodeScanner = new module.Html5QrcodeScanner(
          'qr-reader-container',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        const onScanSuccess = async (decodedText: string) => {
          setScanCode(decodedText);
          html5QrcodeScanner.clear();
          // Call verification
          setScannerLoading(true);
          try {
            const res = await verifyTicket.mutateAsync(decodedText);
            setScanResult({
              success: res.success,
              message: res.message,
              data: res.data,
            });
            refetchAllBookings();
          } catch (err: any) {
            setScanResult({
              success: false,
              message: err.response?.data?.message || 'Invalid Ticket Pass QR Code.',
            });
          } finally {
            setScannerLoading(false);
          }
        };

        html5QrcodeScanner.render(onScanSuccess, (err: any) => {});
      });
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch((e: any) => console.error(e));
      }
    };
  }, [activeTab]);

  // Sync profile edits state when user changes
  useEffect(() => {
    if (user) {
      setProfName(user.name);
      setProfEmail(user.email);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-slate-400">
        Authenticating dashboard session...
      </div>
    );
  }

  // Update profile
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);

    const formData = new FormData();
    formData.append('name', profName);
    formData.append('email', profEmail);
    if (profAvatar) {
      formData.append('avatar', profAvatar);
    }

    try {
      const res = await api.patch('/user/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data && res.data.success) {
        alert('Profile details updated successfully!');
        refreshUser();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Ticket Manual verify
  const executeManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode) return;
    setScannerLoading(true);
    setScanResult(null);

    try {
      const res = await verifyTicket.mutateAsync(scanCode);
      setScanResult({
        success: res.success,
        message: res.message,
        data: res.data,
      });
      refetchAllBookings();
    } catch (err: any) {
      setScanResult({
        success: false,
        message: err.response?.data?.message || 'Verification failed. Incorrect code.',
      });
    } finally {
      setScannerLoading(false);
    }
  };

  // Cancel Booking handler
  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking.mutateAsync({ id });
      refetchMyBookings();
      refetchOverview();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  // Edit event modal launcher
  const openEditEvent = (evt: any) => {
    setEditEventId(evt.id);
    setEvtTitle(evt.title);
    setEvtCategory(evt.categoryId);
    setEvtPrice(evt.ticketPrice);
    setEvtSeats(evt.seatCount);
    setEvtLocation(evt.location);
    // Format date string to yyyy-MM-dd
    const d = new Date(evt.date);
    const dateFormatted = d.toISOString().split('T')[0];
    setEvtDate(dateFormatted);
    setEvtTime(evt.time);
    setEvtStatus(evt.status);
    setEvtDesc(evt.description || '');
    const hl = evt.eventHighlight || {};
    setEvtHighlightDress(hl.dressCode || '');
    setEvtHighlightWorkshops(hl.workshops || 0);
    setEvtHighlightWifi(hl.wifiAvailable ? 'true' : 'false');
    setEvtHighlightParking(hl.parkingFacility || '');
    setEvtBannerFile(null);
    setEventModalOpen(true);
  };

  const openCreateEvent = () => {
    setEditEventId(null);
    setEvtTitle('');
    setEvtCategory(categories?.[0]?.id || '');
    setEvtPrice(0);
    setEvtSeats(100);
    setEvtLocation('');
    setEvtDate('');
    setEvtTime('');
    setEvtStatus('UPCOMING');
    setEvtDesc('');
    setEvtHighlightDress('');
    setEvtHighlightWorkshops(0);
    setEvtHighlightWifi('false');
    setEvtHighlightParking('');
    setEvtBannerFile(null);
    setEventModalOpen(true);
  };

  // Submit Event Form
  const saveEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', evtTitle);
    formData.append('categoryId', evtCategory);
    formData.append('ticketPrice', evtPrice.toString());
    formData.append('seatCount', evtSeats.toString());
    formData.append('location', evtLocation);
    formData.append('date', new Date(evtDate).toISOString());
    formData.append('time', evtTime);
    formData.append('status', evtStatus);
    formData.append('description', evtDesc);
    
    // Add Highlights structure
    const highlights = {
      dressCode: evtHighlightDress || undefined,
      workshops: Number(evtHighlightWorkshops),
      wifiAvailable: evtHighlightWifi === 'true',
      parkingFacility: evtHighlightParking || undefined,
    };
    formData.append('eventHighlight', JSON.stringify(highlights));

    if (evtBannerFile) {
      formData.append('banner', evtBannerFile);
    }

    try {
      if (editEventId) {
        await api.patch(`/events/${editEventId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setEventModalOpen(false);
      refetchEvents();
      refetchOverview();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save event.');
    }
  };

  // Category save
  const saveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', catName);
    formData.append('description', catDesc);
    if (catIconFile) {
      formData.append('icon', catIconFile);
    }

    try {
      if (editCatId) {
        await api.patch(`/event-category/${editCatId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/event-category', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      setCatModalOpen(false);
      refetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save category.');
    }
  };

  // Category Edit opener
  const openEditCat = (cat: any) => {
    setEditCatId(cat.id);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatIconFile(null);
    setCatModalOpen(true);
  };

  // Delete Category
  const handleDeleteCat = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event category?')) return;
    try {
      await deleteCategory.mutateAsync(id);
      refetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent.mutateAsync(id);
      refetchEvents();
      refetchOverview();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  // Submit Broadcast Notification
  const submitBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBroadcast.mutateAsync({
        title: broadTitle,
        message: broadMessage,
        role: broadRole === 'ALL' ? undefined : broadRole,
      });
      setBroadcastOpen(false);
      setBroadTitle('');
      setBroadMessage('');
      alert('Broadcast notification sent successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send broadcast.');
    }
  };

  // Helper mapping navigation sidebar icons
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Ticket, roles: ['USER'] },
    { id: 'staff-scanner', label: 'Ticket Scanner', icon: Camera, roles: ['STAFF', 'MANAGER', 'SYSTEM_OWNER'] },
    { id: 'manage-events', label: 'Manage Events', icon: Calendar, roles: ['MANAGER', 'SYSTEM_OWNER'] },
    { id: 'manage-categories', label: 'Event Categories', icon: Tag, roles: ['SYSTEM_OWNER'] },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'activity-logs', label: 'Activity Logs', icon: Activity },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col md:flex-row">
      
      {/* Dashboard Left Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-white/5 p-6 flex flex-col gap-8 shrink-0">
        
        {/* User Mini Profile info */}
        <div className="flex items-center gap-3 pb-6 border-b border-white/5">
          <Avatar className="w-10 h-10 border border-white/10">
            <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
            <AvatarFallback className="bg-indigo-500/20 text-indigo-400 font-bold">{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
            <p className="text-[10px] font-bold text-indigo-400 tracking-wider mt-0.5 uppercase">
              {user.role === 'USER' ? 'Attendee' : user.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {sidebarItems
            .filter((item) => !item.roles || item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); window.location.hash = item.id; }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === item.id 
                      ? 'bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/15' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer mt-6"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>

      {/* Right Dashboard panel workspace */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl overflow-y-auto">
        
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-10">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Overview Dashboard</h2>
              <p className="text-slate-400 text-xs mt-1">Real-time statistics overview and active metrics.</p>
            </div>

            {/* Stats Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {user.role === 'USER' ? (
                <>
                  <Card className="bg-slate-900/40 border-white/5 p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Bookings</p>
                    <h3 className="text-3xl font-extrabold text-white">{myBookings?.length || 0}</h3>
                  </Card>
                  <Card className="bg-slate-900/40 border-white/5 p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Attended Events</p>
                    <h3 className="text-3xl font-extrabold text-emerald-400">
                      {myBookings?.filter(b => b.status === 'ATTENDED').length || 0}
                    </h3>
                  </Card>
                  <Card className="bg-slate-900/40 border-white/5 p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Spent</p>
                    <h3 className="text-3xl font-extrabold text-pink-500">
                      {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(
                        myBookings?.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.totalAmount, 0) || 0
                      )}
                    </h3>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="bg-slate-900/40 border-white/5 p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Events</p>
                    <h3 className="text-3xl font-extrabold text-white">{stats.totalEvents || 0}</h3>
                  </Card>
                  <Card className="bg-slate-900/40 border-white/5 p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Bookings</p>
                    <h3 className="text-3xl font-extrabold text-white">{stats.totalBookings || 0}</h3>
                  </Card>
                  <Card className="bg-slate-900/40 border-white/5 p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-extrabold text-pink-500">
                      {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(stats.totalRevenue || 0)}
                    </h3>
                  </Card>
                  <Card className="bg-slate-900/40 border-white/5 p-6">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verified Entries</p>
                    <h3 className="text-3xl font-extrabold text-emerald-400">{stats.verifiedTickets || 0} Check-ins</h3>
                  </Card>
                </>
              )}
            </div>

            {/* Quick Actions / Recent Activity layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
              <Card className="bg-slate-900/40 border-white/5 p-6">
                <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-400" /> Recent Bookings
                </h3>
                <div className="flex flex-col gap-4">
                  {user.role === 'USER' ? (
                    myBookings?.slice(0, 3).map((b) => (
                      <div key={b.id} className="flex justify-between items-center p-4 bg-slate-950/40 border border-white/5 rounded-xl">
                        <div>
                          <p className="text-sm font-bold text-white truncate max-w-[200px]">{b.event?.title}</p>
                          <p className="text-[10px] text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => router.push(`/ticket/${b.id}`)}>
                          View Ticket
                        </Button>
                      </div>
                    ))
                  ) : (
                    allBookings?.slice(0, 3).map((b) => (
                      <div key={b.id} className="flex justify-between items-center p-4 bg-slate-950/40 border border-white/5 rounded-xl">
                        <div>
                          <p className="text-sm font-bold text-white truncate max-w-[200px]">{b.event?.title}</p>
                          <p className="text-[10px] text-slate-500">{b.user?.name} ({b.seatCount} Seat)</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${b.status === 'ATTENDED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {b.status}
                        </span>
                      </div>
                    ))
                  )}
                  {((user.role === 'USER' ? myBookings : allBookings)?.length || 0) === 0 && (
                    <p className="text-slate-500 text-sm text-center py-6">No bookings recorded yet.</p>
                  )}
                </div>
              </Card>

              {/* Quick Actions Panel */}
              <Card className="bg-slate-900/40 border-white/5 p-6 flex flex-col gap-6">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" /> Administrative Options
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" className="border-white/5 bg-slate-950/40 hover:bg-white/5 py-6 text-slate-200 cursor-pointer" onClick={() => router.push('/events')}>
                    Browse Events
                  </Button>
                  <Button variant="outline" className="border-white/5 bg-slate-950/40 hover:bg-white/5 py-6 text-slate-200 cursor-pointer" onClick={() => setActiveTab('profile')}>
                    Account Settings
                  </Button>
                  
                  {['MANAGER', 'SYSTEM_OWNER'].includes(user.role) && (
                    <>
                      <Button className="bg-indigo-500 hover:bg-indigo-600 py-6 font-bold cursor-pointer" onClick={openCreateEvent}>
                        <Plus className="w-4.5 h-4.5 mr-2" /> Add Event
                      </Button>
                      <Button variant="outline" className="border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 py-6 cursor-pointer" onClick={() => setBroadcastOpen(true)}>
                        <Bell className="w-4.5 h-4.5 mr-2" /> Broadcast alert
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* MY BOOKINGS PANEL (USER ONLY) */}
        {activeTab === 'bookings' && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">My Bookings</h2>
              <p className="text-slate-400 text-xs mt-1">Manage and view your purchased tickets passes.</p>
            </div>

            <div className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
              <Table>
                <TableHeader className="bg-slate-950/40 border-b border-white/5">
                  <TableRow>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Event Title</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Booking Code</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Seats</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Total Amount</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Status</TableHead>
                    <TableHead className="text-right text-slate-400 font-bold text-xs uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myBookings?.map((b) => (
                    <TableRow key={b.id} className="border-b border-white/5 hover:bg-white/5">
                      <TableCell className="font-bold text-slate-200">{b.event?.title}</TableCell>
                      <TableCell className="font-mono text-pink-500 font-bold">{b.bookingCode}</TableCell>
                      <TableCell className="text-slate-300 font-semibold">{b.seatCount}</TableCell>
                      <TableCell className="text-slate-300 font-semibold">
                        {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(b.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                          b.status === 'ATTENDED' ? 'bg-emerald-500/10 text-emerald-400' : (b.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400')
                        }`}>
                          {b.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right gap-2">
                        <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => router.push(`/ticket/${b.id}`)}>
                          View Pass
                        </Button>
                        {b.status === 'PENDING' && (
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-400 cursor-pointer" onClick={() => handleCancelBooking(b.id)}>
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!myBookings || myBookings.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                        No bookings found. You haven't booked any passes yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* STAFF SCANNER PANEL */}
        {activeTab === 'staff-scanner' && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Gate Ticket Scanner</h2>
              <p className="text-slate-400 text-xs mt-1">Scan QR codes or enter booking code manually to check in attendees.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* QR Camera Reader */}
              <Card className="bg-slate-900/40 border-white/5 p-6 flex flex-col items-center">
                <h3 className="font-bold text-sm text-slate-300 mb-4 uppercase tracking-wider">Live Camera Stream</h3>
                <div id="qr-reader-container" className="w-full max-w-[340px] bg-slate-950 rounded-xl overflow-hidden border border-white/5" />
                <p className="text-xs text-slate-500 mt-4">Point your camera at the VIP Pass QR Code canvas.</p>
              </Card>

              {/* Manual Input / Scan result */}
              <div className="flex flex-col gap-6">
                <Card className="bg-slate-900/40 border-white/5 p-6">
                  <h3 className="font-bold text-sm text-slate-300 mb-4 uppercase tracking-wider">Manual Code Validation</h3>
                  <form onSubmit={executeManualVerify} className="flex gap-2">
                    <Input 
                      placeholder="Enter 6-char booking code..." 
                      value={scanCode}
                      onChange={(e) => setScanCode(e.target.value.toUpperCase())}
                      className="bg-slate-950 border-white/5 text-white"
                      maxLength={12}
                    />
                    <Button type="submit" disabled={scannerLoading || !scanCode} className="bg-indigo-500 hover:bg-indigo-600 font-semibold cursor-pointer">
                      Verify Code
                    </Button>
                  </form>
                </Card>

                {scanResult && (
                  <Card className={`border p-6 flex items-start gap-4 ${
                    scanResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {scanResult.success ? <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" /> : <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />}
                    <div>
                      <h4 className="font-extrabold text-base mb-1">
                        {scanResult.success ? 'Access Granted - Verified' : 'Access Denied - Invalid'}
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed mb-3">{scanResult.message}</p>
                      
                      {scanResult.data && (
                        <div className="text-xs text-slate-400 flex flex-col gap-1 border-t border-white/5 pt-3 mt-1">
                          <p>Attendee: <strong className="text-slate-200">{scanResult.data.user?.name}</strong></p>
                          <p>Event: <strong className="text-slate-200">{scanResult.data.event?.title}</strong></p>
                          <p>Passes: <strong className="text-slate-200">{scanResult.data.seatCount} Seat(s)</strong></p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MANAGE EVENTS PANEL */}
        {activeTab === 'manage-events' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Manage Events</h2>
                <p className="text-slate-400 text-xs mt-1">Publish, edit, and delete platform events listings.</p>
              </div>
              <Button className="bg-indigo-500 hover:bg-indigo-600 font-semibold cursor-pointer" onClick={openCreateEvent}>
                <Plus className="w-4 h-4 mr-2" /> Add New Event
              </Button>
            </div>

            <div className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
              <Table>
                <TableHeader className="bg-slate-950/40 border-b border-white/5">
                  <TableRow>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Event Title</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Date & Time</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Price</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Seats Booked</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Status</TableHead>
                    <TableHead className="text-right text-slate-400 font-bold text-xs uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((evt: any) => (
                    <TableRow key={evt.id} className="border-b border-white/5 hover:bg-white/5">
                      <TableCell className="font-bold text-slate-200">{evt.title}</TableCell>
                      <TableCell className="text-slate-300 font-semibold">
                        {new Date(evt.date).toLocaleDateString()} @ {evt.time}
                      </TableCell>
                      <TableCell className="text-slate-300 font-semibold">
                        {evt.ticketPrice > 0 ? `${new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(evt.ticketPrice)}` : 'Free'}
                      </TableCell>
                      <TableCell className="text-slate-300 font-semibold">
                        {evt.seatCount - evt.availableSeats} / {evt.seatCount}
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                          evt.status === 'UPCOMING' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {evt.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right gap-1">
                        <Button size="icon" variant="ghost" className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => openEditEvent(evt)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-rose-500 hover:text-rose-400 cursor-pointer" onClick={() => handleDeleteEvent(evt.id)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                        No events found in the database. Get started by publishing one!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* EVENT CATEGORIES PANEL (SYSTEM OWNER) */}
        {activeTab === 'manage-categories' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Event Categories</h2>
                <p className="text-slate-400 text-xs mt-1">Configure event taxonomies and categorization rules.</p>
              </div>
              <Button className="bg-indigo-500 hover:bg-indigo-600 font-semibold cursor-pointer" onClick={() => { setEditCatId(null); setCatName(''); setCatDesc(''); setCatIconFile(null); setCatModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Add Category
              </Button>
            </div>

            <div className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
              <Table>
                <TableHeader className="bg-slate-950/40 border-b border-white/5">
                  <TableRow>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Icon</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Category Name</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Slug</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Description</TableHead>
                    <TableHead className="text-right text-slate-400 font-bold text-xs uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories?.map((cat) => (
                    <TableRow key={cat.id} className="border-b border-white/5 hover:bg-white/5">
                      <TableCell>
                        {cat.iconUrl ? (
                          <img src={cat.iconUrl} alt={cat.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <Tag className="w-5 h-5 text-indigo-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-slate-200">{cat.name}</TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">{cat.slug}</TableCell>
                      <TableCell className="text-slate-400 text-sm max-w-[280px] truncate">{cat.description || 'No description.'}</TableCell>
                      <TableCell className="text-right gap-1">
                        <Button size="icon" variant="ghost" className="text-indigo-400 hover:text-white cursor-pointer" onClick={() => openEditCat(cat)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-rose-500 hover:text-rose-400 cursor-pointer" onClick={() => handleDeleteCat(cat.id)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!categories || categories.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-slate-500 text-sm">
                        No categories found in the database.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS PANEL */}
        {activeTab === 'notifications' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">System Alerts</h2>
                <p className="text-slate-400 text-xs mt-1">Inbox notifications logs dispatched by organizers.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => markAllNotificationsRead.mutate()} className="border-white/10 hover:bg-white/5 text-white cursor-pointer">
                  Mark all read
                </Button>
                <Button variant="ghost" size="sm" onClick={() => clearAllNotifications.mutate()} className="text-rose-500 hover:text-rose-400 cursor-pointer">
                  Clear all
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {notifications?.map((not) => (
                <div 
                  key={not.id} 
                  className={`p-5 rounded-2xl border flex gap-4 items-start ${
                    not.isRead 
                      ? 'bg-slate-900/10 border-white/5 text-slate-400' 
                      : 'bg-indigo-500/5 border-indigo-500/10 text-slate-200'
                  }`}
                >
                  <BadgeInfo className={`w-5 h-5 shrink-0 mt-0.5 ${not.isRead ? 'text-slate-500' : 'text-indigo-400'}`} />
                  <div className="flex-grow">
                    <h4 className={`font-bold text-sm ${not.isRead ? 'text-slate-400' : 'text-white'}`}>{not.title}</h4>
                    <p className="text-sm text-slate-400 mt-1 leading-relaxed">{not.message}</p>
                    <span className="text-[10px] text-slate-500 block mt-2">
                      {new Date(not.createdAt).toLocaleDateString()} @ {new Date(not.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {!not.isRead && (
                    <Button size="sm" variant="ghost" onClick={() => markNotificationRead.mutate(not.id)} className="text-indigo-400 hover:text-white cursor-pointer shrink-0">
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
              {(!notifications || notifications.length === 0) && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  Your notification inbox is currently clean.
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE SETTINGS PANEL */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-8 max-w-2xl">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Profile Settings</h2>
              <p className="text-slate-400 text-xs mt-1">Configure your personal credentials and avatars.</p>
            </div>

            <Card className="bg-slate-900/40 border-white/5">
              <CardContent className="p-8">
                <form onSubmit={saveProfile} className="flex flex-col gap-6">
                  
                  <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                    <Avatar className="w-16 h-16 border border-white/10">
                      <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
                      <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-2xl font-bold">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="prof-avatar">Upload New Avatar</Label>
                      <Input 
                        id="prof-avatar" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setProfAvatar(e.target.files ? e.target.files[0] : null)}
                        className="bg-slate-950 border-white/5 text-slate-400 file:text-indigo-400 file:bg-indigo-500/10 file:border-0 file:rounded-md file:text-xs file:font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="prof-name">Full Name</Label>
                    <Input 
                      id="prof-name" 
                      value={profName} 
                      onChange={(e) => setProfName(e.target.value)}
                      className="bg-slate-950 border-white/5 text-white"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="prof-email">Email Address</Label>
                    <Input 
                      id="prof-email" 
                      type="email"
                      value={profEmail} 
                      onChange={(e) => setProfEmail(e.target.value)}
                      className="bg-slate-950 border-white/5 text-white"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={profileSaving} className="bg-indigo-500 hover:bg-indigo-600 font-semibold py-6 rounded-xl mt-2 cursor-pointer">
                    {profileSaving ? 'Saving changes...' : 'Save Settings'}
                  </Button>

                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ACTIVITY LOGS PANEL */}
        {activeTab === 'activity-logs' && (
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Audit Activity Logs</h2>
              <p className="text-slate-400 text-xs mt-1">Audit log records of user sessions actions.</p>
            </div>

            <div className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
              <Table>
                <TableHeader className="bg-slate-950/40 border-b border-white/5">
                  <TableRow>
                    {['SYSTEM_OWNER', 'MANAGER'].includes(user.role) && (
                      <TableHead className="text-slate-400 font-bold text-xs uppercase">User Account</TableHead>
                    )}
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Activity Action</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Details</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">IP Address</TableHead>
                    <TableHead className="text-slate-400 font-bold text-xs uppercase">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(['SYSTEM_OWNER', 'MANAGER'].includes(user.role) ? allLogs : myLogs)?.map((log) => (
                    <TableRow key={log.id} className="border-b border-white/5 hover:bg-white/5">
                      {['SYSTEM_OWNER', 'MANAGER'].includes(user.role) && (
                        <TableCell className="font-bold text-slate-200">
                          {log.user?.name || 'Session user'} ({log.user?.email})
                        </TableCell>
                      )}
                      <TableCell className="text-indigo-400 font-bold text-sm font-mono">{log.action}</TableCell>
                      <TableCell className="text-slate-300 font-semibold">{log.details}</TableCell>
                      <TableCell className="text-slate-500 text-xs font-mono">{log.ipAddress || 'unknown'}</TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {new Date(log.createdAt).toLocaleDateString()} @ {new Date(log.createdAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {((['SYSTEM_OWNER', 'MANAGER'].includes(user.role) ? allLogs : myLogs)?.length || 0) === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-slate-500 text-sm">
                        No activity logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

      </main>

      {/* CREATE / EDIT EVENT MODAL */}
      <Dialog open={eventModalOpen} onOpenChange={setEventModalOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editEventId ? 'Edit Event Publication' : 'Publish New Event'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveEventSubmit} className="flex flex-col gap-5 py-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="evt-title">Event Title</Label>
                <Input 
                  id="evt-title" 
                  value={evtTitle} 
                  onChange={(e) => setEvtTitle(e.target.value)}
                  className="bg-slate-950 border-white/5 text-white" 
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="evt-category">Category</Label>
                <Select value={evtCategory} onValueChange={(val) => setEvtCategory(val ?? '')}>
                  <SelectTrigger className="bg-slate-950 border-white/5 text-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="evt-price">Ticket Price (BDT)</Label>
                <Input 
                  id="evt-price" 
                  type="number" 
                  value={evtPrice} 
                  onChange={(e) => setEvtPrice(Number(e.target.value))}
                  className="bg-slate-950 border-white/5 text-white" 
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="evt-seats">Capacity Seats</Label>
                <Input 
                  id="evt-seats" 
                  type="number" 
                  value={evtSeats} 
                  onChange={(e) => setEvtSeats(Number(e.target.value))}
                  className="bg-slate-950 border-white/5 text-white" 
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="evt-status">Publish Status</Label>
                <Select value={evtStatus} onValueChange={(val: any) => setEvtStatus(val)}>
                  <SelectTrigger className="bg-slate-955 border-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="evt-date">Event Date</Label>
                <Input 
                  id="evt-date" 
                  type="date" 
                  value={evtDate} 
                  onChange={(e) => setEvtDate(e.target.value)}
                  className="bg-slate-955 border-white/5 text-white" 
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="evt-time">Event Time</Label>
                <Input 
                  id="evt-time" 
                  placeholder="09:00 AM - 05:00 PM" 
                  value={evtTime} 
                  onChange={(e) => setEvtTime(e.target.value)}
                  className="bg-slate-955 border-white/5 text-white" 
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="evt-location">Venue Location</Label>
              <Input 
                id="evt-location" 
                placeholder="Bangabandhu International Conference Centre (BICC), Dhaka" 
                value={evtLocation} 
                onChange={(e) => setEvtLocation(e.target.value)}
                className="bg-slate-950 border-white/5 text-white" 
                required
              />
            </div>

            {/* Highlights fields */}
            <div className="p-4 bg-slate-955 border border-white/5 rounded-xl flex flex-col gap-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Highlight Guidelines</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hl-dress">Dress Code</Label>
                  <Input 
                    id="hl-dress" 
                    placeholder="Formal / Smart Casual" 
                    value={evtHighlightDress} 
                    onChange={(e) => setEvtHighlightDress(e.target.value)}
                    className="bg-slate-950 border-white/5 text-white" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hl-workshops">Workshops Count</Label>
                  <Input 
                    id="hl-workshops" 
                    type="number"
                    value={evtHighlightWorkshops} 
                    onChange={(e) => setEvtHighlightWorkshops(Number(e.target.value))}
                    className="bg-slate-950 border-white/5 text-white" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hl-wifi">Wifi available</Label>
                  <Select value={evtHighlightWifi} onValueChange={(val) => setEvtHighlightWifi(val ?? 'false')}>
                    <SelectTrigger className="bg-slate-950 border-white/5 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="hl-parking">Parking Space</Label>
                  <Input 
                    id="hl-parking" 
                    placeholder="Valet parking / Free parking" 
                    value={evtHighlightParking} 
                    onChange={(e) => setEvtHighlightParking(e.target.value)}
                    className="bg-slate-950 border-white/5 text-white" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="evt-desc">Description / Guidelines</Label>
              <textarea 
                id="evt-desc"
                placeholder="Details of what the event covers, keynotes, sponsors..."
                value={evtDesc}
                onChange={(e) => setEvtDesc(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 text-white rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="evt-banner">Event Banner Image</Label>
              <Input 
                id="evt-banner" 
                type="file" 
                accept="image/*"
                onChange={(e) => setEvtBannerFile(e.target.files ? e.target.files[0] : null)}
                className="bg-slate-950 border-white/5 text-slate-400 file:text-indigo-400 file:bg-indigo-500/10 file:border-0 file:rounded-md file:text-xs file:font-semibold"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="secondary" className="border-white/5 hover:bg-white/5 text-white cursor-pointer" onClick={() => setEventModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer">
                {editEventId ? 'Save Changes' : 'Publish Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE / EDIT CATEGORY MODAL */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editCatId ? 'Edit Event Category' : 'Add Event Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveCategorySubmit} className="flex flex-col gap-5 py-4">
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input 
                id="cat-name" 
                value={catName} 
                onChange={(e) => setCatName(e.target.value)}
                className="bg-slate-950 border-white/5 text-white" 
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-desc">Description</Label>
              <textarea 
                id="cat-desc"
                placeholder="Covered tags or themes..."
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 text-white rounded-xl p-3 text-sm min-h-[80px] focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-icon">Category Icon Image</Label>
              <Input 
                id="cat-icon" 
                type="file" 
                accept="image/*"
                onChange={(e) => setCatIconFile(e.target.files ? e.target.files[0] : null)}
                className="bg-slate-950 border-white/5 text-slate-400 file:text-indigo-400 file:bg-indigo-500/10 file:border-0 file:rounded-md file:text-xs file:font-semibold"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="secondary" className="border-white/5 hover:bg-white/5 text-white cursor-pointer" onClick={() => setCatModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer">
                {editCatId ? 'Save Changes' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* BROADCAST ALERT MODAL */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Send Broadcast Notification</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitBroadcast} className="flex flex-col gap-5 py-4">
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="broad-role">Target Audience Group</Label>
              <Select value={broadRole} onValueChange={(val) => setBroadRole(val ?? 'ALL')}>
                <SelectTrigger className="bg-slate-950 border-white/5 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                  <SelectItem value="ALL">All Users / Everyone</SelectItem>
                  <SelectItem value="USER">Attendees Only</SelectItem>
                  <SelectItem value="STAFF">Staff Only</SelectItem>
                  <SelectItem value="MANAGER">Managers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="broad-title">Message Title</Label>
              <Input 
                id="broad-title" 
                placeholder="Alert: Schedule Changed!"
                value={broadTitle} 
                onChange={(e) => setBroadTitle(e.target.value)}
                className="bg-slate-950 border-white/5 text-white" 
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="broad-msg">Alert Message Details</Label>
              <textarea 
                id="broad-msg"
                placeholder="Explain the updates or instructions clearly..."
                value={broadMessage}
                onChange={(e) => setBroadMessage(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 text-white rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="secondary" className="border-white/5 hover:bg-white/5 text-white cursor-pointer" onClick={() => setBroadcastOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer">
                Send Alert
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

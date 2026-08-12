'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Rocket, ShieldAlert, CheckCircle, Mail, Lock, User, FileImage } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

function AuthPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, sendOtp, verifyOtp, isLoggedIn } = useAuth();

  // Active tab state
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState<File | null>(null);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registering, setRegistering] = useState(false);

  // OTP Verification modal state
  const [otpOpen, setOtpOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      const redirect = searchParams.get('redirect');
      router.push(redirect ? decodeURIComponent(redirect) : '/dashboard');
    }
  }, [isLoggedIn, router, searchParams]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    const res = await login(loginEmail, loginPassword);
    setLoggingIn(false);

    if (res.success) {
      const redirect = searchParams.get('redirect');
      router.push(redirect ? decodeURIComponent(redirect) : '/dashboard');
    } else {
      if (res.message.toLowerCase().includes('verify your email')) {
        // Trigger verification Flow
        setVerifyEmail(loginEmail);
        setOtpOpen(true);
        sendOtp(loginEmail);
      } else {
        setLoginError(res.message);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setRegistering(true);

    const formData = new FormData();
    formData.append('name', regName);
    formData.append('email', regEmail);
    formData.append('password', regPassword);
    if (regAvatar) {
      formData.append('avatar', regAvatar);
    }

    const res = await register(formData);
    setRegistering(false);

    if (res.success) {
      setRegisterSuccess(res.message);
      setVerifyEmail(regEmail);
      setOtpOpen(true);
    } else {
      setRegisterError(res.message);
    }
  };

  const executeOtpVerification = async () => {
    if (!otpCode) return;
    setVerifying(true);
    const res = await verifyOtp(verifyEmail, otpCode);
    setVerifying(false);

    if (res.success) {
      setOtpOpen(false);
      alert('Email verified successfully! You can now log in.');
      setActiveTab('login');
    } else {
      alert(res.message || 'OTP verification failed. Check code.');
    }
  };

  const executeResendOtp = async () => {
    setResending(true);
    const res = await sendOtp(verifyEmail);
    setResending(false);
    if (res.success) {
      alert('OTP code resent successfully!');
    } else {
      alert(res.message || 'Failed to resend OTP.');
    }
  };

  const fillQuickCreds = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('123456');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none" style={{ backgroundImage: "url('/assets/images/hero-banner.jpg')" }} />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-[460px] bg-slate-900/60 border-white/5 shadow-2xl backdrop-blur-xl relative z-10">
        <CardContent className="p-8">
          
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white mb-2">
              <Rocket className="w-6 h-6 text-indigo-500 fill-indigo-500/20" />
              <span>Eventify</span>
            </Link>
            <p className="text-slate-400 text-xs text-center">Unlock VIP passes to global cams, tournaments, and summits</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 bg-slate-950/60 border border-white/5 rounded-xl p-1 mb-8">
              <TabsTrigger value="login" className="rounded-lg font-semibold py-2.5 cursor-pointer">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg font-semibold py-2.5 cursor-pointer">Register</TabsTrigger>
            </TabsList>

            {/* SIGN IN VIEW */}
            <TabsContent value="login">
              {loginError && (
                <div className="flex gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input 
                      id="login-email" 
                      type="email" 
                      required
                      placeholder="name@domain.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9 bg-slate-950/60 border-white/5 text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="login-password">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input 
                      id="login-password" 
                      type="password" 
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-9 bg-slate-950/60 border-white/5 text-white"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loggingIn}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 font-semibold py-6 rounded-xl mt-2 cursor-pointer"
                >
                  {loggingIn ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>

              {/* Quick Login credentials filler */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">⚡ Quick Test Accounts</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => fillQuickCreds('system@test.com')}
                    className="p-2.5 bg-slate-950/40 hover:bg-slate-950 border border-white/5 hover:border-indigo-500/30 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold text-white">System Owner</p>
                    <p className="text-[10px] text-slate-500">system@test.com</p>
                  </button>
                  <button 
                    onClick={() => fillQuickCreds('user1@test.com')}
                    className="p-2.5 bg-slate-950/40 hover:bg-slate-950 border border-white/5 hover:border-indigo-500/30 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <p className="text-xs font-bold text-white">User / Attendee</p>
                    <p className="text-[10px] text-slate-500">user1@test.com</p>
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* REGISTER VIEW */}
            <TabsContent value="register">
              {registerError && (
                <div className="flex gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}
              {registerSuccess && (
                <div className="flex gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{registerSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input 
                      id="reg-name" 
                      type="text" 
                      required
                      placeholder="John Doe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="pl-9 bg-slate-950/60 border-white/5 text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input 
                      id="reg-email" 
                      type="email" 
                      required
                      placeholder="name@domain.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-9 bg-slate-950/60 border-white/5 text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input 
                      id="reg-password" 
                      type="password" 
                      required
                      placeholder="Minimum 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-9 bg-slate-950/60 border-white/5 text-white"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-avatar">Profile Picture (Optional)</Label>
                  <div className="relative">
                    <FileImage className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input 
                      id="reg-avatar" 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setRegAvatar(e.target.files ? e.target.files[0] : null)}
                      className="pl-9 bg-slate-950/60 border-white/5 text-slate-400 file:text-indigo-400 file:bg-indigo-500/10 file:border-0 file:rounded-md file:text-xs file:font-semibold"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={registering}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 font-semibold py-6 rounded-xl mt-2 cursor-pointer"
                >
                  {registering ? 'Creating Account...' : 'Register Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>

      {/* OTP VERIFY DIALOG MODAL */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Verify Email Address</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4 text-center">
            <p className="text-slate-400 text-sm">
              An OTP verification code was sent to <strong className="text-white">{verifyEmail}</strong>. Enter it below to activate your account.
            </p>
            <div className="my-4">
              <Input 
                placeholder="123456" 
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="text-center font-bold text-2xl tracking-[8px] bg-slate-950 border-white/5 max-w-[200px] mx-auto py-6"
              />
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={executeResendOtp}
                disabled={resending}
                className="border-white/5 hover:bg-white/5 text-white cursor-pointer"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </Button>
              <Button 
                onClick={executeOtpVerification}
                disabled={verifying || otpCode.length < 6}
                className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
              >
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function AuthPortal() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading Auth Portal...
      </div>
    }>
      <AuthPortalContent />
    </Suspense>
  );
}

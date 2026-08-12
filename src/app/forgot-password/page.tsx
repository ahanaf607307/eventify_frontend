'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Rocket, ShieldAlert, CheckCircle, Mail, Key, Lock, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ForgotPassword() {
  const router = useRouter();
  
  // Step tracker
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter otp + password

  // Inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/otp/send', { email, name: 'Attendee' });
      setLoading(false);
      if (res.data && res.data.success) {
        setSuccess('OTP verification code has been dispatched to your email.');
        setStep(2);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to dispatch verification code.');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/user/reset-password', {
        email,
        otp,
        newPassword,
      });
      setLoading(false);
      if (res.data && res.data.success) {
        alert('Password reset successfully! Redirecting to login.');
        router.push('/login');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to reset password. Verify OTP code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none" style={{ backgroundImage: "url('/assets/images/hero-banner.jpg')" }} />

      <Card className="w-full max-w-[420px] bg-slate-900/60 border-white/5 shadow-2xl backdrop-blur-xl relative z-10">
        <CardContent className="p-8">
          
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white mb-2">
              <Rocket className="w-6 h-6 text-indigo-500 fill-indigo-500/20" />
              <span>Eventify</span>
            </Link>
            <h3 className="text-lg font-bold text-white mt-2">Password Reset</h3>
            <p className="text-slate-400 text-xs text-center mt-1">Recover account access using email OTP codes</p>
          </div>

          {error && (
            <div className="flex gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input 
                    id="reset-email" 
                    type="email" 
                    required
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-slate-950/60 border-white/5 text-white"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !email}
                className="w-full bg-indigo-500 hover:bg-indigo-600 font-semibold py-6 rounded-xl mt-2 cursor-pointer"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="reset-otp">OTP Verification Code</Label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input 
                    id="reset-otp" 
                    type="text" 
                    required
                    placeholder="123456"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-9 bg-slate-950/60 border-white/5 text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="reset-newpassword">New Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input 
                    id="reset-newpassword" 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 bg-slate-950/60 border-white/5 text-white"
                    minLength={6}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !otp || !newPassword}
                className="w-full bg-indigo-500 hover:bg-indigo-600 font-semibold py-6 rounded-xl mt-2 cursor-pointer"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
            <Link href="/login" className="text-slate-400 hover:text-white text-xs flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}

'use client';

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { IconBrandGoogle, IconBrandTwitterFilled, IconBrandFacebookFilled, IconEye, IconEyeOff } from "@tabler/icons-react";

export default function CreateAcount() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        inviteCode: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    
    const { register } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        if (!formData.inviteCode.trim()) {
            newErrors.inviteCode = 'Invite code is required';
        }
        
        if (!termsAccepted) {
            newErrors.terms = 'You must accept the terms of use';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        
        try {
            const success = await register(formData.username, formData.password, formData.inviteCode);
            
            if (success) {
                toast.success('Registration successful! Welcome to WINZO!');
                router.push('/dashboard');
            } else {
                toast.error('Registration failed. Please check your invite code and try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Registration failed. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="login_section pt-120 p3-bg">
            <div className="container-fluid">
                <div className="row justify-content-between align-items-center">
                    <div className="col-6">
                        <div className="login_section__thumb d-none d-lg-block">
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center n4-bg rounded-3" style={{ minHeight: '900px' }}>
                                <div className="text-center p-5">
                                    <h2 className="s1-color mb-4">Join WINZO Today!</h2>
                                    <p className="text-muted mb-4">Create your account to access premium sports betting with real-time odds and comprehensive analytics</p>
                                    <div className="d-flex gap-3 justify-content-center mb-4">
                                        <span className="badge s1-bg text-dark px-3 py-2">🎯 Live Betting</span>
                                        <span className="badge s1-bg text-dark px-3 py-2">📊 Analytics</span>
                                        <span className="badge s1-bg text-dark px-3 py-2">🏆 Best Odds</span>
                                    </div>
                                    <div className="text-muted small">
                                        <p>✓ Professional sports betting platform</p>
                                        <p>✓ Secure transactions and data protection</p>
                                        <p>✓ 24/7 customer support</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-xl-5">
                        <div className="login_section__loginarea">
                            <div className="row justify-content-start">
                                <div className="col-xxl-10">
                                    <div className="pb-10 pt-8 mb-7 mt-12 mt-lg-0 px-4 px-sm-10">
                                        <h3 className="mb-6 mb-md-8">Join WINZO Today</h3>
                                        <p className="mb-10 mb-md-15">Create your account to access professional sports betting with real-time odds, live betting, and comprehensive analytics.</p>
                                        <div className="login_section__form">
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-5 mb-md-6">
                                                    <input 
                                                        className={`n11-bg ${errors.username ? 'border-danger' : ''}`}
                                                        name="username"
                                                        placeholder="Username"
                                                        type="text"
                                                        value={formData.username}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                    {errors.username && (
                                                        <div className="text-danger small mt-1">{errors.username}</div>
                                                    )}
                                                </div>
                                                <div className="mb-5 mb-md-6">
                                                    <input 
                                                        className={`n11-bg ${errors.inviteCode ? 'border-danger' : ''}`}
                                                        name="inviteCode"
                                                        placeholder="Invite Code"
                                                        type="text"
                                                        value={formData.inviteCode}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                    {errors.inviteCode && (
                                                        <div className="text-danger small mt-1">{errors.inviteCode}</div>
                                                    )}
                                                    <div className="text-muted small mt-1">
                                                        Don&apos;t have an invite code? Contact support for access.
                                                    </div>
                                                </div>
                                                <div className="mb-5 mb-md-6 position-relative">
                                                    <input 
                                                        className={`n11-bg ${errors.password ? 'border-danger' : ''}`}
                                                        name="password"
                                                        placeholder="Password"
                                                        type={showPassword ? "text" : "password"}
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent me-3"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        disabled={isLoading}
                                                    >
                                                        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                                    </button>
                                                    {errors.password && (
                                                        <div className="text-danger small mt-1">{errors.password}</div>
                                                    )}
                                                </div>
                                                <div className="mb-5 mb-md-6 position-relative">
                                                    <input 
                                                        className={`n11-bg ${errors.confirmPassword ? 'border-danger' : ''}`}
                                                        name="confirmPassword"
                                                        placeholder="Confirm Password"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={formData.confirmPassword}
                                                        onChange={handleChange}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent me-3"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        disabled={isLoading}
                                                    >
                                                        {showConfirmPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                                    </button>
                                                    {errors.confirmPassword && (
                                                        <div className="text-danger small mt-1">{errors.confirmPassword}</div>
                                                    )}
                                                </div>
                                                <div className="d-flex align-items-center flex-wrap flex-sm-nowrap gap-2 mb-6">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={termsAccepted}
                                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                                        disabled={isLoading}
                                                        required
                                                    />
                                                    <span>I agree to WINZO&apos;s <Link href="/terms" target="_blank">Terms of Use</Link> and <Link href="/privacy" target="_blank">Privacy Policy</Link></span>
                                                    {errors.terms && (
                                                        <div className="text-danger small mt-1 w-100">{errors.terms}</div>
                                                    )}
                                                </div>
                                                <button 
                                                    className="cmn-btn px-5 py-3 mb-6 w-100" 
                                                    type="submit"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Creating Account...
                                                        </>
                                                    ) : (
                                                        'Create Account'
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                        <div className="login_section__socialmedia text-center mb-6">
                                            <span className="mb-6">Or continue with</span>
                                            <div className="login_section__social d-center gap-3">
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={(e) => {e.preventDefault(); toast('Social registration coming soon!');}}>
                                                    <IconBrandFacebookFilled className="ti ti-brand-facebook-filled fs-four" />
                                                </Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={(e) => {e.preventDefault(); toast('Social registration coming soon!');}}>
                                                    <IconBrandTwitterFilled className="ti ti-brand-twitter-filled fs-four" />
                                                </Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={(e) => {e.preventDefault(); toast('Social registration coming soon!');}}>
                                                    <IconBrandGoogle className="ti ti-brand-google fs-four fw-bold " />
                                                </Link>
                                            </div>
                                        </div>
                                        <span className="d-center gap-1">Already have an account? <Link className="g1-color" href="/login">Sign In</Link></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

'use client';

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { IconBrandGoogle, IconBrandTwitterFilled, IconBrandFacebookFilled, IconEye, IconEyeOff } from "@tabler/icons-react";

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    
    const { login } = useAuth();
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
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
            const success = await login(formData.username, formData.password);
            
            if (success) {
                toast.success('Login successful! Welcome to WINZO!');
                router.push('/dashboard');
            } else {
                toast.error('Invalid username or password. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please check your connection and try again.');
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
                                    <h2 className="s1-color mb-4">Welcome Back!</h2>
                                    <p className="text-muted mb-4">Sign in to access your WINZO sports betting account</p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <span className="badge s1-bg text-dark px-3 py-2">⚽ Soccer</span>
                                        <span className="badge s1-bg text-dark px-3 py-2">🏀 Basketball</span>
                                        <span className="badge s1-bg text-dark px-3 py-2">🏈 Football</span>
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
                                        <h3 className="mb-6 mb-md-8">Welcome to WINZO</h3>
                                        <p className="mb-10 mb-md-15">Sign in to your sports betting account and access real-time odds, live betting, and comprehensive sports analytics.</p>
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
                                                <button 
                                                    className="cmn-btn px-5 py-3 mb-6 w-100" 
                                                    type="submit"
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Signing In...
                                                        </>
                                                    ) : (
                                                        'Sign In'
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                        <div className="login_section__socialmedia text-center mb-6">
                                            <span className="mb-6">Or continue with</span>
                                            <div className="login_section__social d-center gap-3">
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={(e) => {e.preventDefault(); toast('Social login coming soon!');}}>
                                                    <IconBrandFacebookFilled className="ti ti-brand-facebook-filled fs-four" />
                                                </Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={(e) => {e.preventDefault(); toast('Social login coming soon!');}}>
                                                    <IconBrandTwitterFilled className="ti ti-brand-twitter-filled fs-four" />
                                                </Link>
                                                <Link href="#" className="n11-bg px-3 py-2 rounded-5" onClick={(e) => {e.preventDefault(); toast('Social login coming soon!');}}>
                                                    <IconBrandGoogle className="ti ti-brand-google fs-four fw-bold" />
                                                </Link>
                                            </div>
                                        </div>
                                        <span className="d-center gap-1">Don&apos;t have an account? <Link className="g1-color" href="/create-acount">Sign Up Now</Link></span>
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { usePopup } from '../context/PopupContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { showPopup } = usePopup();

    return (
        <div className="bg-background text-on-surface antialiased min-h-screen">
            <div className="flex min-h-screen w-full">
                {/* Left Side: Ambient Nature Image (Hidden on mobile) */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-high items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop')"}}></div>
                    {/* Optional subtle overlay for brand coloring */}
                    <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                    <div className="relative z-10 p-12 max-w-lg text-white backdrop-blur-sm bg-black/30 rounded-2xl m-8">
                        <span className="material-symbols-outlined text-[64px] mb-4" style={{fontVariationSettings: "'FILL' 1"}}>landscape</span>
                        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white">Find Your Next Adventure</h1>
                        <p className="text-lg text-white/90 font-medium">Experience the perfect intersection of the great outdoors and premium digital hospitality.</p>
                    </div>
                </div>
                {/* Right Side: Login Form */}
                <div className="w-full lg:w-1/2 flex flex-col bg-surface relative min-h-screen">
                    <div className="w-full max-w-md m-auto px-6 sm:px-10 py-12">
                        {/* Branding Header */}
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>hiking</span>
                                </div>
                                <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">CAMPSS</h2>
                            </div>
                            <h3 className="text-2xl font-bold text-on-surface mb-2">Welcome back</h3>
                            <p className="text-base text-on-surface-variant font-medium">Please enter your details to access your account.</p>
                        </div>
                        {/* Form */}
                        <form className="space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            const username = e.target.elements.username.value;
                            const password = e.target.elements.password.value;
                            
                            try {
                                const response = await api.post('/auth/login', {
                                    username,
                                    password
                                });
                                
                                if (response.data.access_token) {
                                    localStorage.setItem('access_token', response.data.access_token);
                                    
                                    // Fetch user profile to check role
                                    const userResponse = await api.get('/auth/me');
                                    const role = userResponse.data.role;
                                    
                                    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
                                        navigate('/admin/dashboard');
                                    } else {
                                        navigate('/hiker/dashboard');
                                    }
                                } else {
                                    showPopup('Login Failed', response.data.message || 'Login failed', 'error');
                                }
                            } catch (error) {
                                showPopup('Error', error.response?.data?.message || 'Failed to login', 'error');
                            }
                        }}>
                            {/* Username Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-on-surface" htmlFor="username">Username or Email</label>
                                <div className="relative">
                                    <input className="w-full h-14 bg-surface-container-low border-2 border-border rounded-xl px-4 py-3 text-base text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-0 transition-colors font-medium" id="username" placeholder="Enter your username (type 'admin' for admin portal)" type="text" required/>
                                </div>
                            </div>
                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-on-surface" htmlFor="password">Password</label>
                                <div className="relative">
                                    <input className="w-full h-14 bg-surface-container-low border-2 border-border rounded-xl px-4 py-3 text-base text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-0 transition-colors font-medium" id="password" placeholder="••••••••" type="password" required/>
                                    <button aria-label="Toggle password visibility" className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors" type="button">
                                        <span className="material-symbols-outlined">visibility_off</span>
                                    </button>
                                </div>
                            </div>
                            {/* Options Row */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-border group-hover:border-primary transition-colors">
                                        <input className="peer sr-only" type="checkbox"/>
                                        <span className="material-symbols-outlined text-[16px] text-white opacity-0 peer-checked:opacity-100 peer-checked:bg-primary absolute inset-0 rounded-sm transition-all" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
                                    </div>
                                    <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
                                </label>
                                <a className="text-sm font-bold text-primary hover:text-primary/80 transition-colors" href="#">Forgot Password?</a>
                            </div>
                            {/* CTA */}
                            <button className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-base shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all flex items-center justify-center gap-2 mt-8" type="submit">
                                Login
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        </form>
                        {/* Footer Link */}
                        <div className="mt-10 text-center">
                            <p className="text-sm font-medium text-on-surface-variant">
                                Don't have an account? 
                                <Link className="text-sm font-bold text-primary hover:text-primary/80 hover:underline transition-all ml-1" to="/register">Register here</Link>
                            </p>
                        </div>
                    </div>
                    {/* Bottom Branding */}
                    <div className="w-full text-center pb-8">
                        <p className="text-xs font-bold text-outline-variant uppercase tracking-widest">Campurejo Smart System</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

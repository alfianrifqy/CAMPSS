import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { usePopup } from '../context/PopupContext';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        phone: '',
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const { showPopup } = usePopup();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const response = await api.post('/auth/register', formData);
            if (response.data.message === "Register success") {
                showPopup('Success', 'Account created successfully! Please sign in.', 'success');
                navigate('/login');
            } else {
                setErrorMsg(response.data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error(error);
            setErrorMsg(error.response?.data?.message || 'An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background text-on-background h-full min-h-screen flex flex-col font-body-md antialiased">
            <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative overflow-hidden py-12">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40">
                    <div className="absolute -top-64 -left-64 w-[600px] h-[600px] rounded-full bg-surface-container-high blur-3xl mix-blend-multiply"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-surface-container-low blur-3xl mix-blend-multiply"></div>
                </div>
                
                <div className="w-full max-w-md bg-surface rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-10 border border-surface-container-highest flex flex-col gap-6 relative z-10 m-auto">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">CAMPSS</h1>
                        <p className="font-body-md text-on-surface-variant">Create your account to start exploring.</p>
                    </div>
                    
                    {errorMsg && (
                        <div className="bg-error/10 text-error p-3 rounded-lg text-sm text-center font-medium">
                            {errorMsg}
                        </div>
                    )}

                    <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                        {/* Full Name */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-on-surface" htmlFor="full_name">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">person</span>
                                <input className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-lg text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" id="full_name" name="full_name" placeholder="John Doe" required type="text" value={formData.full_name} onChange={handleChange} />
                            </div>
                        </div>
                        
                        {/* Username */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-on-surface" htmlFor="username">Username</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">badge</span>
                                <input className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-lg text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" id="username" name="username" placeholder="johndoe123" required type="text" value={formData.username} onChange={handleChange} />
                            </div>
                        </div>
                        
                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-on-surface" htmlFor="email">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">mail</span>
                                <input className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-lg text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" id="email" name="email" placeholder="name@example.com" required type="email" value={formData.email} onChange={handleChange} />
                            </div>
                        </div>
                        
                        {/* Phone Number */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-on-surface" htmlFor="phone">Phone Number</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">call</span>
                                <input className="w-full h-12 pl-10 pr-4 bg-surface border border-border rounded-lg text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" id="phone" name="phone" placeholder="+62 812..." required type="tel" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>
                        
                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label className="font-label-sm text-on-surface" htmlFor="password">Password</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">lock</span>
                                <input className="w-full h-12 pl-10 pr-10 bg-surface border border-border rounded-lg text-on-surface font-body-md placeholder:text-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" id="password" name="password" placeholder="••••••••" required type="password" value={formData.password} onChange={handleChange} />
                            </div>
                            <p className="text-on-surface-variant mt-1 text-xs">Must be at least 8 characters long.</p>
                        </div>
                        
                        {/* Terms */}
                        <div className="flex items-center gap-2 mt-2">
                            <input className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 cursor-pointer" id="terms" name="terms" required type="checkbox" />
                            <label className="text-sm text-on-surface-variant cursor-pointer" htmlFor="terms">
                                I agree to the <a className="text-primary hover:underline font-medium" href="#">Terms of Service</a> and <a className="text-primary hover:underline font-medium" href="#">Privacy Policy</a>
                            </label>
                        </div>
                        
                        {/* CTA */}
                        <button disabled={loading} className={`w-full h-12 mt-2 bg-primary text-white font-bold rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'}`} type="submit">
                            {loading ? 'Creating...' : 'Create Account'}
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                    </form>
                    
                    <div className="mt-2 text-center">
                        <p className="text-sm text-on-surface-variant">
                            Already have an account? 
                            <Link className="text-primary font-bold hover:underline transition-all ml-1" to="/login">Sign In</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;

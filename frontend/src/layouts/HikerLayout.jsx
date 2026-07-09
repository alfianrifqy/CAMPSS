import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const HikerLayout = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data.role !== 'HIKER') {
                    navigate('/login');
                } else {
                    setProfile(response.data);
                }
            } catch (error) {
                navigate('/login');
            }
        };
        fetchProfile();

        const handleProfileUpdate = () => fetchProfile();
        window.addEventListener('profileUpdated', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, [navigate]);

    if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;

    return (
        <div className="font-body-md text-on-surface bg-background antialiased min-h-screen flex flex-col md:flex-row">
            {/* SideNavBar (Desktop) */}
            <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40 p-6 w-64 bg-surface border-r border-border">
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-primary tracking-tight">Hiker Portal</h1>
                    <p className="text-sm text-on-surface-variant font-medium mt-1">Mount Prau Adventure</p>
                </div>
                
                <div className="flex items-center gap-3 mb-8 bg-surface-container-low p-3 rounded-2xl shadow-sm border border-border">
                    {profile.profile_picture ? (
                        <img src={profile.profile_picture} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-border shadow-sm" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                            {profile.full_name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <p className="font-bold text-sm text-on-surface truncate">{profile.full_name}</p>
                        <p className="text-xs text-on-surface-variant truncate">{profile.email}</p>
                    </div>
                </div>
                
                <nav className="flex-1 space-y-2">
                    <NavLink to="/hiker/dashboard" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-all font-semibold text-sm ${isActive ? 'bg-secondary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/hiker/schedule" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-all font-semibold text-sm ${isActive ? 'bg-secondary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                        <span className="material-symbols-outlined">calendar_month</span>
                        <span>Schedule</span>
                    </NavLink>
                    <NavLink to="/hiker/reservation" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-all font-semibold text-sm ${isActive ? 'bg-secondary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                        <span className="material-symbols-outlined">landscape</span>
                        <span>My Hikes</span>
                    </NavLink>
                    <NavLink to="/hiker/profile" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-all font-semibold text-sm ${isActive ? 'bg-secondary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                        <span className="material-symbols-outlined">person</span>
                        <span>Profile</span>
                    </NavLink>
                </nav>
                
                <div className="mt-auto pt-6 border-t border-border space-y-3">
                    <Link to="/hiker/reservation/new" className="w-full bg-primary text-white hover:bg-primary/90 transition-all py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">add_circle</span>
                        Book New Hike
                    </Link>
                    <button onClick={() => {
                        localStorage.removeItem('access_token');
                        navigate('/login');
                    }} className="w-full flex items-center justify-center gap-2 text-on-surface-variant p-3 hover:bg-surface-variant hover:text-danger transition-colors rounded-xl font-semibold text-sm">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* BottomNavBar (Mobile) */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border-t border-border">
                <NavLink to="/hiker/dashboard" className={({isActive}) => `flex flex-col items-center justify-center transition-colors rounded-lg p-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
                    <span className="text-[10px] font-semibold mt-1">Home</span>
                </NavLink>
                <NavLink to="/hiker/schedule" className={({isActive}) => `flex flex-col items-center justify-center transition-colors rounded-lg p-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined">calendar_month</span>
                    <span className="text-[10px] font-semibold mt-1">Schedule</span>
                </NavLink>
                <NavLink to="/hiker/reservation" className={({isActive}) => `flex flex-col items-center justify-center transition-colors rounded-lg p-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined">hiking</span>
                    <span className="text-[10px] font-semibold mt-1">Bookings</span>
                </NavLink>
                <NavLink to="/hiker/profile" className={({isActive}) => `flex flex-col items-center justify-center transition-colors rounded-lg p-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[10px] font-semibold mt-1">Profile</span>
                </NavLink>
            </nav>

            {/* Main Canvas */}
            <main className="flex-1 md:ml-64 p-6 md:p-12 pb-32 md:pb-12 w-full max-w-[1280px] mx-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default HikerLayout;

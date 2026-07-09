import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminLayout = () => {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data.role !== 'ADMIN' && response.data.role !== 'SUPER_ADMIN') {
                    navigate('/login');
                } else {
                    setProfile(response.data);
                }
            } catch (error) {
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;

    return (
        <div className="font-body-md text-on-surface bg-background flex flex-col min-h-screen">
            {/* TopNavBar */}
            <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm">
                <div className="flex justify-between items-center px-6 md:px-12 h-20 max-w-[1280px] mx-auto w-full">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/dashboard" className="text-3xl font-extrabold text-primary tracking-tight">CAMPSS</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => {
                            localStorage.removeItem('access_token');
                            navigate('/login');
                        }} className="bg-primary/10 text-primary rounded-xl px-6 py-2 font-bold text-sm hover:bg-primary hover:text-white transition-colors">Logout</button>
                    </div>
                </div>
            </header>
            
            <div className="flex flex-1 pt-20">
                {/* SideNavBar */}
                <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full z-40 p-6 w-64 bg-surface border-r border-border pt-[100px]">
                    <div className="mb-8 px-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                            {profile.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="font-bold text-sm text-primary truncate">{profile.full_name}</h2>
                            <p className="text-xs text-on-surface-variant font-medium">{profile.role}</p>
                        </div>
                    </div>
                    <nav className="flex-1 flex flex-col gap-2">
                        <NavLink to="/admin/dashboard" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors font-semibold text-sm ${isActive ? 'bg-secondary/10 text-primary translate-x-1' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/schedule" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors font-semibold text-sm ${isActive ? 'bg-secondary/10 text-primary translate-x-1' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>calendar_month</span>
                            <span>Schedules</span>
                        </NavLink>
                        <NavLink to="/admin/reservations" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors font-semibold text-sm ${isActive ? 'bg-secondary/10 text-primary translate-x-1' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>confirmation_number</span>
                            <span>Reservations</span>
                        </NavLink>
                        <NavLink to="/admin/reports" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors font-semibold text-sm ${isActive ? 'bg-secondary/10 text-primary translate-x-1' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>analytics</span>
                            <span>Reports</span>
                        </NavLink>
                        <NavLink to="/admin/scan" className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors font-semibold text-sm ${isActive ? 'bg-secondary/10 text-primary translate-x-1' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>qr_code_scanner</span>
                            <span>Scan QR</span>
                        </NavLink>
                    </nav>
                </aside>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border-t border-border">
                    <NavLink to="/admin/dashboard" className={({isActive}) => `flex flex-col items-center justify-center transition-colors rounded-lg p-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>dashboard</span>
                        <span className="text-[10px] font-semibold mt-1">Home</span>
                    </NavLink>
                    <NavLink to="/admin/schedule" className={({isActive}) => `flex flex-col items-center justify-center transition-colors rounded-lg p-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>calendar_month</span>
                        <span className="text-[10px] font-semibold mt-1">Schedules</span>
                    </NavLink>
                    <NavLink to="/admin/reservations" className={({isActive}) => `flex flex-col items-center justify-center transition-colors rounded-lg p-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>confirmation_number</span>
                        <span className="text-[10px] font-semibold mt-1">Reservations</span>
                    </NavLink>
                    <NavLink to="/admin/reports" className={({isActive}) => `flex flex-col items-center justify-center transition-colors rounded-lg p-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>analytics</span>
                        <span className="text-[10px] font-semibold mt-1">Reports</span>
                    </NavLink>
                    <NavLink to="/admin/scan" className={({isActive}) => `flex flex-col items-center justify-center transition-colors rounded-lg p-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>qr_code_scanner</span>
                        <span className="text-[10px] font-semibold mt-1">Scan QR</span>
                    </NavLink>
                </nav>

                <main className="flex-1 ml-0 md:ml-64 p-6 md:p-12 w-full max-w-[1280px] mx-auto pb-32 md:pb-12">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const HikerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const profileRes = await api.get('/auth/me');
                setProfile(profileRes.data);

                const dashRes = await api.get('/dashboard/user');
                setDashboardData(dashRes.data);
            } catch (error) {
                console.error("Failed to load dashboard", error);
            }
        };
        fetchDashboard();
    }, []);

    if (!dashboardData || !profile) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            {/* Header Area */}
            <header className="flex justify-between items-end mb-8">
                <div>
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Overview</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">Hello, {profile.full_name}!</h2>
                </div>
                <div className="hidden md:flex gap-4">
                    <button className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors shadow-sm border border-border">
                        <span className="material-symbols-outlined">search</span>
                    </button>
                </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Primary Focus: Upcoming Hike (Spans 8 cols on desktop) */}
                <section className="md:col-span-8 bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col border border-border">
                    {dashboardData.next_hiking ? (
                        <>
                            <div className="relative h-64 md:h-72 w-full">
                                <img className="absolute inset-0 w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-700" alt="Mountain summit at sunrise" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYFw4LAekiQzs5QYCnHhTQDdIz_pJ488sbv13S4SDMQnQBomwo39VUIQxBtPX_Ki0ZKr1wUAHdAEWu6Py886_4vJ9QX_WI_uoow0hX9J_nTNvarRqEGnp9N356U61f14YoN52gBhT6wkVTyGRIUFsYtAhvtIMwbv8uYeBmOUi86zgDXf0FVIAwXyOovTqxuXJTlO1ZGWK4vRGak75gIA5Ccb-3ai1XfILZjhnaA3aD3fNlcI7Em3pcSWh1SXpIBaZBoj6sKaNjlnqm" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                                    <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
                                    <span className="text-xs text-on-surface font-bold uppercase tracking-wide">Confirmed</span>
                                </div>
                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <div className="flex items-center gap-2 text-white/80 text-xs font-semibold uppercase tracking-widest mb-2">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        Mount Prau Summit Trail
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-white mb-3">Next Expedition</h3>
                                    <div className="flex items-center gap-6 text-white/90 text-sm font-medium">
                                        <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">calendar_today</span> {new Date(dashboardData.next_hiking.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                                        <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[18px]">group</span> {dashboardData.next_hiking.members} Hikers</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 flex justify-between items-center bg-surface flex-1">
                                <div className="flex items-center text-sm font-bold text-on-surface-variant">
                                    Booking Code: {dashboardData.next_hiking.booking_code}
                                </div>
                                <Link to="/hiker/reservation" className="px-6 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm hover:bg-primary hover:text-white transition-colors">View Details</Link>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
                            <span className="material-symbols-outlined text-6xl text-surface-variant mb-4">hiking</span>
                            <h3 className="text-2xl font-extrabold text-on-surface mb-2">No Upcoming Hikes</h3>
                            <p className="text-on-surface-variant mb-6">You don't have any confirmed hikes yet. Ready for an adventure?</p>
                            <Link to="/hiker/schedule" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm">
                                Book a Hike Now
                            </Link>
                        </div>
                    )}
                </section>

                {/* Status & Summary Column (Spans 4 cols on desktop) */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    {/* Reservation Status */}
                    <section className="bg-surface rounded-2xl p-6 shadow-sm border border-border flex-1">
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Active Permits</h4>
                        
                        <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-border mb-3">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                                    <span className="material-symbols-outlined">confirmation_number</span>
                                </div>
                                <div>
                                    <p className="text-base text-on-surface font-bold">Valid Tickets</p>
                                    <p className="text-sm text-on-surface-variant font-medium">Qty: {dashboardData.active_tickets}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Current Ticket / QR */}
                    <section className="bg-primary text-white rounded-2xl p-6 shadow-md flex-1 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-[100px]">qr_code_scanner</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Next Access</p>
                            {dashboardData.next_hiking ? (
                                <>
                                    <p className="text-2xl font-bold mb-2">Mount Prau Summit</p>
                                    <p className="text-sm font-medium text-white/80">Date: {dashboardData.next_hiking.date}</p>
                                    <p className="text-sm font-medium text-white/80">Code: {dashboardData.next_hiking.booking_code}</p>
                                </>
                            ) : (
                                <p className="text-2xl font-bold mb-2 text-white">No Upcoming Hikes</p>
                            )}
                        </div>
                        <div className="mt-8 relative z-10">
                            <Link to="/hiker/reservation" className="w-full bg-white text-primary hover:bg-surface-container transition-colors py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined">visibility</span>
                                View Bookings
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Announcements (Spans 6 cols) */}
                <section className="md:col-span-6 bg-surface rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Latest Announcements</h4>
                        <a className="text-primary text-sm font-bold hover:underline" href="#">View All</a>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-surface-container-low rounded-xl flex gap-4 items-start hover:bg-surface-container transition-colors cursor-pointer border border-border/50">
                            <div className="mt-1 text-warning bg-warning/10 p-2 rounded-full"><span className="material-symbols-outlined text-[20px]">warning</span></div>
                            <div>
                                <p className="text-base text-on-surface font-bold mb-1">Weather Advisory: High Winds</p>
                                <p className="text-sm text-on-surface-variant leading-relaxed">Please ensure all tents are securely pegged. High winds expected at the summit area between 2 AM and 6 AM.</p>
                                <p className="text-xs text-on-surface-variant font-medium mt-3">2 hours ago</p>
                            </div>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl flex gap-4 items-start hover:bg-surface-container transition-colors cursor-pointer border border-border/50">
                            <div className="mt-1 text-primary bg-primary/10 p-2 rounded-full"><span className="material-symbols-outlined text-[20px]">campaign</span></div>
                            <div>
                                <p className="text-base text-on-surface font-bold mb-1">New Water Source Available</p>
                                <p className="text-sm text-on-surface-variant leading-relaxed">A new filtered water station has been installed at Pos 3. Remember to bring your reusable bottles.</p>
                                <p className="text-xs text-on-surface-variant font-medium mt-3">Yesterday</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Activity Log (Spans 6 cols) */}
                <section className="md:col-span-6 bg-surface rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Recent Activity</h4>
                    </div>
                    <div className="relative pl-6 border-l-2 border-border/70 space-y-8 py-2">
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-primary border-4 border-surface shadow-sm"></div>
                            <p className="text-base text-on-surface font-bold mb-0.5">Permit Approved</p>
                            <p className="text-sm text-on-surface-variant">Sunrise Expedition permit has been approved by admin.</p>
                            <p className="text-xs font-medium text-on-surface-variant mt-2">Today, 10:24 AM</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-surface-variant border-4 border-surface"></div>
                            <p className="text-base text-on-surface font-bold mb-0.5">Payment Successful</p>
                            <p className="text-sm text-on-surface-variant">Booking #BK-4992 paid via Credit Card.</p>
                            <p className="text-xs font-medium text-on-surface-variant mt-2">Oct 10, 14:05 PM</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-surface-variant border-4 border-surface"></div>
                            <p className="text-base text-on-surface font-bold mb-0.5">Gear Added</p>
                            <p className="text-sm text-on-surface-variant">Added '2-Person Tent' to upcoming booking.</p>
                            <p className="text-xs font-medium text-on-surface-variant mt-2">Oct 9, 09:12 AM</p>
                        </div>
                    </div>
                </section>

            </div>
        </>
    );
};

export default HikerDashboard;

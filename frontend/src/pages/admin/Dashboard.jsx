import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import api from '../../services/api';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/dashboard/admin');
                setDashboardData(response.data);
                
                // Fetch recent reservations for activity
                const resResponse = await api.get('/reservations/');
                // Sort by created_at descending if not already sorted, and take top 3
                const sortedRes = resResponse.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);
                setRecentActivities(sortedRes);
            } catch (error) {
                console.error("Failed to load admin dashboard", error);
            }
        };
        fetchDashboard();
    }, []);

    if (!dashboardData) return (
        <div className="flex-1 flex items-center justify-center text-primary h-screen">
             <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
        </div>
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return "bg-[#fff3e0] text-[#e65100] border-[#ffe0b2]";
            case 'PAID':
                return "bg-[#e8f5e9] text-[#1b5e20] border-[#c8e6c9]";
            case 'CANCELLED':
                return "bg-[#ffebee] text-[#b71c1c] border-[#ffcdd2]";
            default:
                return "bg-surface-variant text-on-surface-variant border-border";
        }
    };

    return (
        <div className="max-w-[1280px] mx-auto w-full flex flex-col gap-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight">Admin Overview</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between h-32 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-on-surface-variant">Active Hikers</span>
                        <span className="material-symbols-outlined text-primary">groups</span>
                    </div>
                    <div className="text-4xl font-extrabold text-on-surface">{dashboardData.total_users}</div>
                </div>
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between h-32 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-on-surface-variant">Total Res.</span>
                        <span className="material-symbols-outlined text-primary">event_note</span>
                    </div>
                    <div className="text-4xl font-extrabold text-on-surface">{dashboardData.total_reservations}</div>
                </div>
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between h-32 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-on-surface-variant">Total Revenue</span>
                        <span className="material-symbols-outlined text-success">payments</span>
                    </div>
                    <div className="text-4xl font-extrabold text-on-surface">Rp {dashboardData.total_revenue.toLocaleString('id-ID')}</div>
                </div>
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border flex flex-col justify-between h-32 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-on-surface-variant">Upcoming Schedules</span>
                        <span className="material-symbols-outlined text-primary">calendar_today</span>
                    </div>
                    <div className="text-4xl font-extrabold text-on-surface">{dashboardData.upcoming_schedules.length}</div>
                </div>
            </div>

            {/* Dashboard Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Quota Overview (Chart Placeholder) */}
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border lg:col-span-1 min-h-[300px] flex flex-col">
                    <h3 className="text-xl font-bold text-primary mb-4">Upcoming Schedule Status</h3>
                    {dashboardData.upcoming_schedules.length > 0 ? (
                        <div className="flex flex-col gap-4 flex-1 justify-center">
                            {dashboardData.upcoming_schedules.slice(0, 3).map((schedule, idx) => (
                                <div key={schedule.id || idx} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-on-surface">{format(parseISO(schedule.date), 'MMM d, yyyy')}</span>
                                        <span className="text-primary">{schedule.total - schedule.remaining} / {schedule.total}</span>
                                    </div>
                                    <div className="w-full bg-surface-variant rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{width: `${((schedule.total - schedule.remaining) / schedule.total) * 100}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">calendar_month</span>
                            <p className="text-sm font-medium">No upcoming schedules</p>
                        </div>
                    )}
                </div>
                
                {/* Monthly Growth (Chart Placeholder) */}
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border lg:col-span-2 min-h-[300px] flex flex-col">
                    <h3 className="text-xl font-bold text-primary mb-4">Monthly Growth</h3>
                    <div className="flex-1 flex items-end justify-between gap-2 pt-8 border-b border-l border-border pb-2 pl-2">
                        {/* Bar chart simulation */}
                        <div className="w-1/12 bg-primary/20 rounded-t-sm h-[40%] hover:bg-primary transition-colors"></div>
                        <div className="w-1/12 bg-primary/20 rounded-t-sm h-[55%] hover:bg-primary transition-colors"></div>
                        <div className="w-1/12 bg-primary/20 rounded-t-sm h-[45%] hover:bg-primary transition-colors"></div>
                        <div className="w-1/12 bg-primary/20 rounded-t-sm h-[70%] hover:bg-primary transition-colors"></div>
                        <div className="w-1/12 bg-primary/20 rounded-t-sm h-[60%] hover:bg-primary transition-colors"></div>
                        <div className="w-1/12 bg-primary/20 rounded-t-sm h-[85%] hover:bg-primary transition-colors"></div>
                        <div className="w-1/12 bg-primary rounded-t-sm h-[100%] hover:bg-primary transition-colors relative">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-xs font-bold px-2 py-1 rounded">Current</div>
                        </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-semibold text-on-surface-variant pl-2">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border mb-10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Recent Reservations</h3>
                    <Link to="/admin/reservations" className="text-primary text-sm font-bold hover:underline">View All</Link>
                </div>
                <div className="flex flex-col gap-4">
                    {recentActivities.length === 0 ? (
                        <p className="text-center text-sm text-on-surface-variant font-medium py-4">No recent activity found.</p>
                    ) : (
                        recentActivities.map(activity => (
                            <div key={activity.id} className="flex items-center justify-between p-4 border border-border rounded-xl hover:border-primary/30 transition-shadow bg-surface group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">event_available</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-on-surface">{activity.leader_name} <span className="font-medium text-on-surface-variant">booked a hike</span></p>
                                        <p className="text-xs text-on-surface-variant font-medium">Group of {activity.total_members} • Booking {activity.booking_code}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-semibold text-on-surface-variant">
                                        {formatDistanceToNow(parseISO(activity.created_at), { addSuffix: true })}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusStyle(activity.status)}`}>
                                        {activity.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

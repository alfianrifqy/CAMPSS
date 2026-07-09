import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import api from '../../services/api';

const SchedulePage = () => {
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const response = await api.get('/schedules/');
                // Assuming response is paginated (items)
                setSchedules(response.data.items || response.data);
            } catch (error) {
                console.error("Failed to load schedules", error);
            }
        };
        fetchSchedules();
    }, []);

    return (
        <div className="flex flex-col gap-10">
            {/* Header & Filters */}
            <section className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface">Available Hikes</h1>
                    <p className="text-lg font-medium text-text-secondary">Select a date to begin your journey. Availability is updated in real-time.</p>
                </div>
                
                {/* Filter Bar */}
                <div className="bg-surface/80 backdrop-blur-md p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-end md:items-center shadow-sm border border-border">
                    <div className="flex flex-col w-full md:w-auto gap-1">
                        <label className="text-xs font-bold text-on-surface-variant">Select Date Range</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">calendar_month</span>
                            <input className="w-full md:w-64 h-12 pl-10 pr-4 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium text-on-surface bg-surface" placeholder="Upcoming Month" type="text" />
                        </div>
                    </div>
                    <div className="flex flex-col w-full md:w-auto gap-1">
                        <label className="text-xs font-bold text-on-surface-variant">Availability</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">filter_list</span>
                            <select className="w-full md:w-48 h-12 pl-10 pr-8 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium text-on-surface bg-surface appearance-none">
                                <option>All Status</option>
                                <option>Open</option>
                                <option>Filling Fast</option>
                            </select>
                        </div>
                    </div>
                    <button className="w-full md:w-auto h-12 px-6 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-md hover:bg-primary/90 transition-all ml-auto flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                        Find Schedule
                    </button>
                </div>
            </section>

            {/* Schedule Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {schedules.map((schedule) => (
                    <article key={schedule.id} className="bg-surface rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3 border border-border hover:border-primary group">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-primary uppercase tracking-wider">Hike Date</span>
                                <h3 className="text-xl font-bold text-on-surface">{format(parseISO(schedule.hiking_date), 'dd MMM yyyy')}</h3>
                            </div>
                            <div className={`px-3 py-1 rounded-full flex items-center gap-1 border ${schedule.status === 'OPEN' ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'}`}>
                                <span className={`w-2 h-2 rounded-full ${schedule.status === 'OPEN' ? 'bg-success' : 'bg-warning'}`}></span>
                                <span className="text-xs font-bold text-on-surface">{schedule.status}</span>
                            </div>
                        </div>
                        <hr className="border-border" />
                        <div className="grid grid-cols-2 gap-3 py-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-outline-variant">sunny</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-text-secondary">Weather</span>
                                    <span className="text-sm font-medium text-on-surface">{schedule.weather_status || 'Unknown'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-outline-variant">group</span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-text-secondary">Quota</span>
                                    <span className="text-sm font-medium text-on-surface">{schedule.quota - schedule.remaining_quota} / {schedule.quota}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mt-auto pt-2">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-text-secondary">Starting from</span>
                                <span className="text-2xl font-bold text-primary">Rp {schedule.price}</span>
                            </div>
                            <Link to={`/hiker/reservation/new?scheduleId=${schedule.id}`} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                Reserve Now
                            </Link>
                        </div>
                    </article>
                ))}

            </section>
        </div>
    );
};

export default SchedulePage;

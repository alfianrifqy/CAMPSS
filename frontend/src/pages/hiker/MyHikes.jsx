import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';

const MyHikesPage = () => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await api.get('/reservations/');
                setReservations(response.data);
            } catch (error) {
                console.error("Failed to fetch reservations", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReservations();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center text-primary min-h-[50vh]">
                 <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-on-surface mb-2">My Hikes</h1>
                <p className="text-on-surface-variant font-medium">Manage your upcoming and past expeditions.</p>
            </div>

            {reservations.length === 0 ? (
                <div className="bg-surface rounded-2xl p-12 text-center border border-border flex flex-col items-center">
                    <span className="material-symbols-outlined text-6xl text-surface-variant mb-4">hiking</span>
                    <h3 className="text-2xl font-bold text-on-surface mb-2">No Hikes Found</h3>
                    <p className="text-on-surface-variant mb-6">You haven't booked any hikes yet.</p>
                    <Link to="/hiker/schedule" className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-sm">
                        Book a Hike Now
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reservations.map(res => (
                        <div key={res.id} className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                            <div className="p-6 border-b border-border flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${res.status === 'PAID' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                        {res.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-on-surface-variant">{res.booking_code}</span>
                                </div>
                                <h3 className="text-xl font-extrabold text-on-surface mb-1">Mount Prau Summit</h3>
                                <p className="text-sm font-medium text-on-surface-variant mb-4">
                                    <span className="material-symbols-outlined text-[16px] align-middle mr-1">calendar_today</span>
                                    {format(new Date(res.created_at), 'dd MMM yyyy')}
                                </p>
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-xs text-text-secondary font-bold uppercase mb-0.5">Leader</p>
                                        <p className="text-sm font-bold text-on-surface truncate max-w-[100px]">{res.leader_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary font-bold uppercase mb-0.5">Members</p>
                                        <p className="text-sm font-bold text-on-surface">{res.total_members} Hikers</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-surface-container-low p-5 flex justify-between items-center">
                                <span className="font-extrabold text-primary text-lg">Rp {res.total_price.toLocaleString('id-ID')}</span>
                                <Link to={`/hiker/reservation/${res.id}`} className="text-sm font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1">
                                    View Details <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyHikesPage;

import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import api from '../../services/api';

const ReservationDetailPage = () => {
    const { id } = useParams();
    const [reservation, setReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                const response = await api.get(`/reservations/${id}`);
                setReservation(response.data);
            } catch (error) {
                console.error("Failed to load reservation details", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReservation();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center text-primary min-h-[50vh]">
                 <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
                <h2 className="text-2xl font-bold text-on-surface mb-4">Reservation Not Found</h2>
                <Link to="/hiker/dashboard" className="text-primary font-bold hover:underline">Go back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Link to="/hiker/dashboard" className="md:hidden text-on-surface">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">Reservation Details</h2>
                    </div>
                    <p className="text-sm font-medium text-text-secondary">Booking ID: #{reservation.booking_code}</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${reservation.status === 'PAID' || reservation.status === 'COMPLETED' ? 'bg-success/20 text-[#1B5E20]' : 'bg-warning/20 text-warning'}`}>
                        <span className="material-symbols-outlined text-[16px]">{reservation.status === 'PAID' ? 'check_circle' : 'pending_actions'}</span> {reservation.status.replace('_', ' ')}
                    </span>
                    {reservation.status === 'PAID' || reservation.status === 'COMPLETED' ? (
                        <Link 
                            to={`/hiker/reservation/${reservation.id}/ticket`}
                            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:bg-primary/90 transition-all"
                        >
                            <span className="material-symbols-outlined">qr_code</span> View E-Ticket
                        </Link>
                    ) : (
                        <Link to={`/hiker/reservation/success?reservationId=${reservation.id}`} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:bg-primary/90 transition-all">
                            <span className="material-symbols-outlined">payments</span> Pay Now
                        </Link>
                    )}
                </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left Column: Route & Members */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    {/* Route Card */}
                    <div className="bg-surface rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border border-border">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full opacity-20 -z-10"></div>
                        <h3 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">route</span> Itinerary
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                            <div>
                                <p className="text-xs font-bold text-text-secondary mb-1">Trail Route</p>
                                <p className="text-base font-medium text-on-surface">Mount Prau via Campurejo</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-secondary mb-1">Check-in Date</p>
                                <p className="text-base font-medium text-on-surface">{format(parseISO(reservation.schedule.hiking_date), 'dd MMM yyyy')}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-secondary mb-1">Check-in Time</p>
                                <p className="text-base font-medium text-on-surface">08:00 AM WIB</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-text-secondary mb-1">Duration</p>
                                <p className="text-base font-medium text-on-surface">1 Night</p>
                            </div>
                        </div>
                    </div>

                    {/* Member List Card */}
                    <div className="bg-surface rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">groups</span> Hikers ({reservation.total_members})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Name</th>
                                        <th className="py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">ID</th>
                                        <th className="py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Contact</th>
                                        <th className="py-3 px-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservation.members.map((member, index) => (
                                        <tr key={index} className="border-b border-border hover:bg-surface-variant/30 transition-colors">
                                            <td className="py-4 px-4 text-sm font-medium text-on-surface">{member.full_name}</td>
                                            <td className="py-4 px-4 text-xs font-medium text-text-secondary">{member.nik}</td>
                                            <td className="py-4 px-4 text-xs font-medium text-text-secondary">{member.phone}</td>
                                            <td className="py-4 px-4">
                                                {member.is_leader ? (
                                                    <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">Leader</span>
                                                ) : (
                                                    <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-xs font-bold">Member</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment & Maps */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    {/* Payment Summary Card */}
                    <div className="bg-surface rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border">
                        <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">receipt_long</span> Payment Summary
                        </h3>
                        <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-border">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-text-secondary">Tickets ({reservation.total_members}x)</span>
                                <span className="text-sm font-medium text-on-surface">Rp {reservation.total_price.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-sm font-bold text-on-surface">Total</span>
                            <span className="text-xl font-bold text-primary">Rp {reservation.total_price.toLocaleString('id-ID')}</span>
                        </div>
                        
                        {reservation.status === 'PAID' ? (
                            <div className="bg-success/10 p-4 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-success mt-0.5">verified_user</span>
                                <div>
                                    <p className="text-xs font-bold text-on-surface">Payment Successful</p>
                                    <p className="text-xs font-medium text-text-secondary">Fully Paid</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-warning/10 p-4 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-warning mt-0.5">error</span>
                                <div>
                                    <p className="text-xs font-bold text-on-surface">Payment Required</p>
                                    <p className="text-xs font-medium text-text-secondary">Please complete your payment.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Basecamp Location */}
                    <div className="bg-surface rounded-2xl p-0 shadow-sm overflow-hidden flex flex-col h-64 border border-border">
                        <div className="bg-cover bg-center w-full flex-1" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCDpEph8VzQzCRWBQy-U730Kmt224bdxRHNhmRJchjnkEjEQE7BJAIUVp7uBC4BPKz6VTU64r-fesLSntOMULwP-s5pF8pDDwsB6mAFK9_Meq-IGkl8aHdaVzseROdb6BRQDPL_zyveyUEb08I_MDuM8VnGF8F4tWmWl5W2WmaPgw0yj2NjxdDbNetMsYE0yTYJQm4ZcQwuRTcv1jB5smCjY2d9CVYPz4qu_1KGOIh3oieM6v-ikT3lPwz-fvqhzrFJEzj2tdK3P8aD')"}}></div>
                        <div className="p-4 bg-surface flex justify-between items-center border-t border-border">
                            <div>
                                <p className="text-xs font-bold text-on-surface">Basecamp Campurejo</p>
                                <p className="text-xs font-medium text-text-secondary">Wonosobo, Central Java</p>
                            </div>
                            <button className="text-primary hover:bg-surface-variant p-2 rounded-full transition-colors">
                                <span className="material-symbols-outlined">directions</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationDetailPage;

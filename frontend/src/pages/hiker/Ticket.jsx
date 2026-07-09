import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import api from '../../services/api';

const TicketPage = () => {
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
                <h2 className="text-2xl font-bold text-on-surface mb-4">Ticket Not Found</h2>
                <Link to="/hiker/dashboard" className="text-primary font-bold hover:underline">Go back to Dashboard</Link>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col gap-10 animate-fade-in max-w-4xl mx-auto w-full pb-10 mt-4 md:mt-0">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
                <div className="flex items-center gap-4">
                    <Link to={`/hiker/reservation/${reservation.id}`} className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-surface-variant transition-colors shadow-sm text-on-surface">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h2 className="text-3xl font-extrabold text-on-surface">Your E-Ticket</h2>
                </div>
                <button onClick={handlePrint} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined">print</span> Print / Save PDF
                </button>
            </header>

            {/* Ticket Card Design */}
            <div className="relative bg-surface rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row mx-auto w-full ticket-container border border-border">
                
                {/* Left Side: Info */}
                <div className="flex-1 p-8 md:p-10 relative">
                    {/* Decorative Background Map/Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
                    
                    <div className="flex items-center gap-3 mb-10">
                        <span className="material-symbols-outlined text-primary text-4xl">landscape</span>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">CAMPSS</h1>
                            <p className="text-xs font-bold text-primary tracking-[0.2em] uppercase">Mount Prau Adventure</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                        <div className="col-span-2">
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Lead Hiker</p>
                            <p className="text-xl font-bold text-on-surface uppercase">{reservation.leader_name}</p>
                        </div>
                        
                        <div>
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Hiking Date</p>
                            <p className="text-lg font-bold text-on-surface">{format(parseISO(reservation.schedule.hiking_date), 'dd MMM yyyy')}</p>
                        </div>
                        
                        <div>
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Total Members</p>
                            <p className="text-lg font-bold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">group</span> {reservation.total_members} Hikers
                            </p>
                        </div>
                        
                        <div>
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Basecamp Route</p>
                            <p className="text-lg font-bold text-on-surface">Campurejo</p>
                        </div>
                        
                        <div>
                            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Status</p>
                            {reservation.checkin_status === 'CHECKED OUT' ? (
                                <span className="inline-flex items-center gap-1 text-sm font-bold text-error bg-error/10 px-3 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-[16px]">block</span> Expired
                                </span>
                            ) : reservation.checkin_status === 'HIKING' ? (
                                <span className="inline-flex items-center gap-1 text-sm font-bold text-[#8B6000] bg-warning/20 px-3 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-[16px]">hiking</span> Active (Hiking)
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-sm font-bold text-success bg-success/10 px-3 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-[16px]">verified</span> Valid
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-10 pt-6 border-t border-dashed border-border/60">
                        <p className="text-xs font-medium text-text-secondary leading-relaxed">
                            Please present this E-Ticket along with a valid ID card (KTP/Passport) for all members at the basecamp registration desk. Do not share this QR code with others.
                        </p>
                    </div>
                </div>
                
                {/* Dashed Separator */}
                <div className="hidden md:flex flex-col justify-center items-center relative w-8">
                    {/* Top Notch */}
                    <div className="absolute top-[-16px] w-8 h-8 bg-background rounded-full z-10 border-b border-border shadow-inner"></div>
                    <div className="h-full border-l-2 border-dashed border-border/50"></div>
                    {/* Bottom Notch */}
                    <div className="absolute bottom-[-16px] w-8 h-8 bg-background rounded-full z-10 border-t border-border shadow-inner"></div>
                </div>
                
                {/* Right Side: QR Code */}
                <div className="w-full md:w-80 bg-surface-container flex flex-col items-center justify-center p-10 relative border-t md:border-t-0 md:border-l border-dashed border-border/50">
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 border border-border/50 relative overflow-hidden">
                        {reservation.checkin_status === 'CHECKED OUT' && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center border-4 border-error/50 rounded-2xl m-2 rotate-[-10deg]">
                                <span className="material-symbols-outlined text-4xl text-error mb-1">block</span>
                                <span className="text-error font-black text-2xl tracking-widest uppercase">EXPIRED</span>
                                <span className="text-error/70 font-bold text-xs">TICKET USED</span>
                            </div>
                        )}
                        
                        {reservation.ticket?.qr_code_url ? (
                            <img 
                                src={`http://127.0.0.1:8000${reservation.ticket.qr_code_url}`} 
                                alt="Ticket QR Code" 
                                className={`w-48 h-48 object-contain ${reservation.checkin_status === 'CHECKED OUT' ? 'opacity-30 grayscale' : ''}`}
                            />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-xl">
                                <span className="text-sm font-medium text-text-secondary">QR Not Available</span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 text-center">Ticket Number</p>
                    <p className="text-sm font-mono font-bold text-on-surface text-center break-all">{reservation.ticket?.ticket_number || 'N/A'}</p>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mt-4 mb-1 text-center">Booking ID</p>
                    <p className="text-sm font-mono font-bold text-on-surface text-center">{reservation.booking_code}</p>
                </div>
            </div>
            
            <style>{`
                @media print {
                    body {
                        background-color: white !important;
                    }
                    /* Hide sidebar from HikerLayout if it has a specific class, or let user print specific div */
                    nav, aside, header, .sidebar {
                        display: none !important;
                    }
                    .ticket-container {
                        box-shadow: none !important;
                        border: 2px solid #e2e8f0 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default TicketPage;

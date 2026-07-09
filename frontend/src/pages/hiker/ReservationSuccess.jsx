import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { usePopup } from '../../context/PopupContext';

const ReservationSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const reservationId = searchParams.get('reservationId');
    const [reservation, setReservation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);
    const navigate = useNavigate();
    const { showPopup } = usePopup();

    useEffect(() => {
        if (!reservationId) return;

        const fetchReservation = async () => {
            try {
                const response = await api.get(`/reservations/${reservationId}`);
                setReservation(response.data);
            } catch (error) {
                console.error("Failed to load reservation", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReservation();
    }, [reservationId]);

    const handlePayment = async () => {
        setIsPaying(true);
        try {
            const response = await api.post('/payments/create', {
                reservation_id: reservationId
            });
            // Redirect to Midtrans snap payment URL
            if (response.data && response.data.payment_url) {
                window.location.href = response.data.payment_url;
            } else {
                showPopup('Error', 'Payment URL not found in response.', 'error');
            }
        } catch (error) {
            console.error("Payment error", error);
            showPopup('Payment Failed', 'Failed to initialize payment: ' + (error.response?.data?.message || "Unknown error"), 'error');
        } finally {
            setIsPaying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-background min-h-[calc(100vh-80px)] md:min-h-screen flex items-center justify-center p-6 w-full text-primary">
                <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
            </div>
        );
    }

    if (!reservation) {
        return (
            <div className="bg-background min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 w-full text-center">
                <h1 className="text-2xl font-bold text-on-surface mb-2">Reservation Not Found</h1>
                <Link to="/hiker/dashboard" className="text-primary font-bold hover:underline">Return to Dashboard</Link>
            </div>
        );
    }

    const handleSimulateSuccess = async () => {
        try {
            await api.post(`/payments/simulate-success/${reservation.id}`);
            showPopup('Success', 'Mock payment callback sent! The reservation should now be PAID. Refreshing...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error(error);
            showPopup('Error', 'Failed to simulate payment.', 'error');
        }
    };

    return (
        <div className="bg-background min-h-[calc(100vh-80px)] md:min-h-screen flex items-center justify-center p-6 md:p-12 w-full animate-fade-in">
            {/* Main Content Canvas */}
            <main className="w-full max-w-[600px] mx-auto bg-surface rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 md:p-10 text-center overflow-hidden relative border border-border">
                
                {/* Decorative Header Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-primary/10 rounded-t-2xl"></div>
                
                {/* Success Icon */}
                <div className="relative z-10 w-24 h-24 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[48px] text-white">check_circle</span>
                </div>
                
                {/* Headline */}
                <h1 className="text-3xl md:text-5xl font-extrabold text-on-surface mb-2 relative z-10 tracking-tight">Reservation Confirmed!</h1>
                <p className="text-lg font-medium text-on-surface-variant mb-10 relative z-10">Your adventure at Mount Prau awaits. Please complete your payment to get your QR Ticket.</p>
                
                {/* Booking Details Card */}
                <div className="bg-surface-variant/30 rounded-xl p-6 mb-10 text-left border border-border">
                    <h2 className="text-xl font-bold text-on-surface mb-6">Booking Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Booking Code</span>
                            <span className="text-lg font-bold text-primary">{reservation.booking_code}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Status</span>
                            <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full w-fit ${reservation.status === 'PAID' ? 'text-success bg-success/10' : 'text-warning bg-warning/10'}`}>
                                <span className="material-symbols-outlined text-[16px]">{reservation.status === 'PAID' ? 'verified' : 'pending_actions'}</span> {reservation.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex flex-col mt-3">
                            <span className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Total Members</span>
                            <span className="text-base font-medium text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px] text-primary">group</span> {reservation.total_members} Hikers
                            </span>
                        </div>
                        <div className="flex flex-col mt-3">
                            <span className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Total Amount</span>
                            <span className="text-lg font-bold text-on-surface">Rp {reservation.total_price.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
                
                {/* Call to Actions */}
                <div className="flex flex-col gap-4 justify-center w-full relative z-10">
                    <button 
                        onClick={handlePayment} 
                        disabled={isPaying || reservation.status !== 'PENDING_PAYMENT'}
                        className={`w-full text-white text-base font-bold px-6 py-4 rounded-xl transition-colors duration-200 shadow-md flex items-center justify-center gap-2 ${reservation.status === 'PENDING_PAYMENT' ? 'bg-primary hover:bg-primary/90' : 'bg-success hover:bg-success/90 cursor-not-allowed'}`}
                    >
                        {isPaying ? (
                            <><span className="material-symbols-outlined animate-spin">progress_activity</span> Connecting to Midtrans...</>
                        ) : reservation.status === 'PENDING_PAYMENT' ? (
                            <>Pay with Midtrans <span className="material-symbols-outlined">payments</span></>
                        ) : (
                            <>Payment Completed <span className="material-symbols-outlined">check_circle</span></>
                        )}
                    </button>

                    {reservation.status === 'PENDING_PAYMENT' && (
                        <button 
                            onClick={handleSimulateSuccess}
                            className="w-full bg-secondary text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-secondary/90 transition-colors shadow-sm mt-2 flex justify-center items-center gap-2"
                        >
                            <span className="material-symbols-outlined">bug_report</span> Simulate Payment Success (Local Test)
                        </button>
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-4 mt-2">
                        <Link to="/hiker/dashboard" className="w-full md:w-1/2 border-[1.5px] border-border text-on-surface text-sm font-bold px-6 py-3 rounded-xl hover:bg-surface-variant transition-colors duration-200 text-center">
                            Go to Dashboard
                        </Link>
                        <Link to={`/hiker/reservation/${reservation.id}`} className="w-full md:w-1/2 border-[1.5px] border-primary text-primary text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary/5 transition-colors duration-200 text-center">
                            View Details
                        </Link>
                    </div>
                </div>
                
            </main>
        </div>
    );
};

export default ReservationSuccessPage;

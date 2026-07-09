import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import api from '../../services/api';
import { usePopup } from '../../context/PopupContext';

const ReservationFormPage = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const scheduleId = searchParams.get('scheduleId');

    const [schedule, setSchedule] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [leader, setLeader] = useState({
        full_name: '',
        phone: ''
    });

    const [members, setMembers] = useState([]);
    const [showProfileAlert, setShowProfileAlert] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showPopup } = usePopup();

    useEffect(() => {
        if (!scheduleId) {
            navigate('/hiker/schedule');
            return;
        }

        const fetchScheduleAndProfile = async () => {
            try {
                const [scheduleRes, profileRes] = await Promise.all([
                    api.get(`/schedules/${scheduleId}`),
                    api.get('/auth/me')
                ]);
                
                setSchedule(scheduleRes.data);

                if (!profileRes.data.is_profile_complete) {
                    setShowProfileAlert(true);
                    setIsLoading(false);
                    return;
                }
                
                setLeader(prev => ({
                    ...prev,
                    full_name: profileRes.data.full_name || '',
                    phone: profileRes.data.phone || '',
                    nik: profileRes.data.nik || ''
                }));
            } catch (error) {
                console.error("Failed to load schedule or profile", error);
                showPopup('Error', 'Schedule not found or unavailable.', 'error');
                navigate('/hiker/schedule');
            } finally {
                setIsLoading(false);
            }
        };
        fetchScheduleAndProfile();
    }, [scheduleId, navigate]);

    const handleAddMember = () => {
        setMembers([...members, { id: Date.now(), full_name: '', nik: '', ktp_photo: null }]);
    };

    const handleRemoveMember = (id) => {
        setMembers(members.filter(m => m.id !== id));
    };

    const handleMemberChange = (id, field, value) => {
        setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simple validation
        if (!leader.full_name || !leader.phone) {
            showPopup('Warning', 'Leader information is missing. Please update your profile.', 'warning');
            return;
        }

        for (let m of members) {
            if (!m.full_name || !m.nik || !m.ktp_photo) {
                showPopup('Warning', 'Please fill in all member information including Identity Photo (KTP).', 'warning');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload = {
                schedule_id: scheduleId,
                members: [
                    {
                        full_name: leader.full_name,
                        nik: leader.nik,
                        phone: leader.phone
                    },
                    ...members.map(m => ({
                        full_name: m.full_name,
                        nik: m.nik
                    }))
                ]
            };

            const formData = new FormData();
            formData.append('payload', JSON.stringify(payload));
            
            members.forEach((m, index) => {
                if (m.ktp_photo) {
                    // index + 1 because the leader is index 0 in the backend
                    formData.append(`member_ktp_${index + 1}`, m.ktp_photo);
                }
            });
            
            const response = await api.post('/reservations/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate(`/hiker/reservation/success?reservationId=${response.data.reservation_id}`);
        } catch (error) {
            console.error("Failed to submit reservation", error);
            showPopup('Booking Failed', 'Failed to create reservation: ' + (error.response?.data?.message || "Unknown error"), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center text-primary min-h-screen">
                 <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
            </div>
        );
    }

    const totalHikers = 1 + members.length;
    const ticketPrice = schedule.price * totalHikers;
    const adminFee = 5000 * totalHikers; // Assume 5000 per hiker admin fee just for UI demonstration
    const totalPrice = ticketPrice + adminFee;

    return (
        <div className="flex-grow w-full max-w-[1280px] mx-auto flex flex-col animate-fade-in">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight mb-2">Book Your Adventure</h1>
                <p className="text-lg font-medium text-on-surface-variant">Complete the details below to secure your spot at Mount Prau.</p>
            </div>

            {/* Progress Indicator */}
            <div className="w-full max-w-3xl mx-auto mb-10">
                <div className="flex items-center justify-between relative">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center relative z-10 w-24">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300 ${step >= 1 ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                            {step > 1 ? <span className="material-symbols-outlined text-[20px]">check</span> : 1}
                        </div>
                        <span className={`mt-2 text-xs font-bold text-center ${step >= 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Schedule</span>
                    </div>
                    
                    <div className={`flex-1 h-1 transition-colors duration-300 ${step >= 2 ? 'bg-primary' : 'bg-surface-variant/50'}`}></div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center relative z-10 w-24">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300 ${step >= 2 ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                            {step > 2 ? <span className="material-symbols-outlined text-[20px]">check</span> : 2}
                        </div>
                        <span className={`mt-2 text-xs font-bold text-center ${step >= 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Leader Info</span>
                    </div>

                    <div className={`flex-1 h-1 transition-colors duration-300 ${step >= 3 ? 'bg-primary' : 'bg-surface-variant/50'}`}></div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center relative z-10 w-24">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300 ${step >= 3 ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                            3
                        </div>
                        <span className={`mt-2 text-xs font-bold text-center ${step >= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>Members</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 relative items-start">
                
                {/* Left Column: Form Steps */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    
                    {/* Step 1: Schedule */}
                    <section className={`bg-surface rounded-2xl p-6 shadow-sm border border-border transition-all duration-300 ${step === 1 ? '' : 'hidden'}`}>
                        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">calendar_month</span>
                            Selected Schedule
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant mb-2">Check-in Date</label>
                                <div className="p-4 bg-surface-container rounded-xl border border-border text-on-surface font-semibold">
                                    {format(parseISO(schedule.hiking_date), 'dd MMMM yyyy')}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant mb-2">Duration (Nights)</label>
                                <div className="p-4 bg-surface-container rounded-xl border border-border text-on-surface font-semibold">
                                    1 Night (Standard)
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button className="bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-primary/90 transition-all flex items-center gap-2" onClick={() => setStep(2)}>
                                Continue
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </section>

                    {/* Step 2: Leader Information */}
                    <section className={`bg-surface rounded-2xl p-6 shadow-sm border border-border transition-all duration-300 ${step === 2 ? '' : 'hidden'}`}>
                        <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person</span>
                            Leader Information
                        </h2>
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex gap-3">
                            <span className="material-symbols-outlined text-primary">info</span>
                            <p className="text-sm font-medium text-primary">
                                As the account owner, you are automatically designated as the group leader. 
                                Your detailed information (NIK, Emergency Contact, KTP Photo) will be securely retrieved from your completed profile and attached to this booking.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant mb-2">Full Name (Auto-filled from Profile)</label>
                                <input 
                                    className="w-full h-12 px-4 rounded-xl border border-border bg-surface-variant text-on-surface-variant cursor-not-allowed transition-colors text-sm font-medium" 
                                    type="text" 
                                    value={leader.full_name}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant mb-2">Phone Number (Auto-filled from Profile)</label>
                                <input 
                                    className="w-full h-12 px-4 rounded-xl border border-border bg-surface-variant text-on-surface-variant cursor-not-allowed transition-colors text-sm font-medium" 
                                    type="tel" 
                                    value={leader.phone}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-between">
                            <button className="text-primary border border-primary text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary/5 transition-all flex items-center gap-2" onClick={() => setStep(1)}>
                                <span className="material-symbols-outlined">arrow_back</span>
                                Back
                            </button>
                            <button className="bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-primary/90 transition-all flex items-center gap-2" onClick={() => setStep(3)}>
                                Continue
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    </section>

                    {/* Step 3: Member Information */}
                    <section className={`bg-surface rounded-2xl p-6 shadow-sm border border-border transition-all duration-300 ${step === 3 ? '' : 'hidden'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">groups</span>
                                Additional Members
                            </h2>
                            <button 
                                onClick={handleAddMember}
                                className="text-primary text-xs font-bold flex items-center gap-1 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary/30"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                                Add Member
                            </button>
                        </div>
                        
                        {members.length === 0 ? (
                            <div className="p-8 border border-dashed border-border rounded-xl text-center flex flex-col items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">person_add</span>
                                <p className="text-on-surface-variant font-medium text-sm">No additional members added.</p>
                                <p className="text-on-surface-variant/70 text-xs mt-1">Hiking alone? Feel free to continue.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {members.map((member, index) => (
                                    <div key={member.id} className="border border-border rounded-xl p-4 relative group hover:border-primary transition-colors bg-surface">
                                        <button 
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="absolute top-3 right-3 text-outline hover:text-error transition-colors"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                        <h3 className="text-sm font-bold text-on-surface mb-3">Member {index + 1}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-on-surface-variant mb-1">Full Name</label>
                                                <input 
                                                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                                                    placeholder="Name" 
                                                    type="text" 
                                                    value={member.full_name}
                                                    onChange={(e) => handleMemberChange(member.id, 'full_name', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-on-surface-variant mb-1">Identity ID</label>
                                                <input 
                                                    className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                                                    placeholder="ID Number" 
                                                    type="text" 
                                                    value={member.nik}
                                                    onChange={(e) => handleMemberChange(member.id, 'nik', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-on-surface-variant mb-1">Identity Photo (KTP/Passport)</label>
                                            <input 
                                                className="w-full h-10 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
                                                type="file"
                                                accept="image/jpeg, image/png"
                                                onChange={(e) => handleMemberChange(member.id, 'ktp_photo', e.target.files[0])}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 flex justify-between">
                            <button className="text-primary border border-primary text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary/5 transition-all flex items-center gap-2" onClick={() => setStep(2)}>
                                <span className="material-symbols-outlined">arrow_back</span>
                                Back
                            </button>
                            <span className="text-on-surface-variant text-xs font-medium self-center">Review your summary before submitting</span>
                        </div>
                    </section>
                </div>

                {/* Right Column: Sidebar Summary */}
                <aside className="w-full lg:w-1/3 lg:sticky lg:top-8">
                    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
                        <h3 className="text-lg font-bold text-on-surface mb-4 pb-4 border-b border-border">Reservation Summary</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[20px]">landscape</span>
                                    <span className="text-xs font-medium">Destination</span>
                                </div>
                                <span className="text-sm font-bold text-right">Mount Prau<br/><span className="text-text-secondary text-xs font-medium">Patak Banteng</span></span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                    <span className="text-xs font-medium">Date</span>
                                </div>
                                <span className="text-sm font-bold">{format(parseISO(schedule.hiking_date), 'dd MMM yyyy')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[20px]">group</span>
                                    <span className="text-xs font-medium">Hikers</span>
                                </div>
                                <span className="text-sm font-bold">{totalHikers} Person(s)</span>
                            </div>
                        </div>

                        <div className="bg-surface-variant/30 rounded-xl p-4 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-on-surface-variant">Ticket Price (x{totalHikers})</span>
                                <span className="text-xs font-medium">Rp {ticketPrice.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-on-surface-variant">Admin Fee</span>
                                <span className="text-xs font-medium">Rp {adminFee.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="border-t border-border pt-2 mt-2 flex justify-between items-center">
                                <span className="text-sm font-bold text-on-surface">Total</span>
                                <span className="text-xl font-bold text-primary">Rp {totalPrice.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-6 text-success bg-success/10 px-3 py-2 rounded-xl">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            <span className="text-xs font-bold">{schedule.remaining_quota} Quota Remaining</span>
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            className={`w-full bg-primary text-white text-sm font-bold py-3 rounded-xl shadow-sm hover:shadow-md hover:bg-primary/90 transition-all flex items-center justify-center ${step === 3 && !isSubmitting ? '' : 'opacity-50 cursor-not-allowed'}`} 
                            disabled={step !== 3 || isSubmitting}
                        >
                            {isSubmitting ? (
                                <><span className="material-symbols-outlined animate-spin mr-2">progress_activity</span> Submitting...</>
                            ) : (
                                "Submit Reservation"
                            )}
                        </button>
                        <p className="text-center text-xs font-medium text-text-secondary mt-3">Complete all steps to submit</p>
                    </div>
                </aside>

            </div>

            {/* Profile Incomplete Modal */}
            {showProfileAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface w-full max-w-md rounded-2xl p-6 shadow-xl border border-border">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center text-[#8B6000]">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-extrabold text-center text-on-surface mb-2">Profile Incomplete</h3>
                        <p className="text-sm font-medium text-center text-on-surface-variant mb-6">
                            For security and safety reasons, you must complete your profile (Identity ID, Emergency Contact, and Photo KTP) before booking a hike.
                        </p>
                        <button 
                            onClick={() => navigate('/hiker/profile')}
                            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
                        >
                            Go to Profile Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationFormPage;

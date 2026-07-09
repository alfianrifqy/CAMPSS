import React, { useState, useEffect } from 'react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    isSameMonth, 
    isSameDay, 
    addDays,
    parseISO
} from 'date-fns';
import api from '../../services/api';
import { usePopup } from '../../context/PopupContext';

const AdminScheduleManagement = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { showPopup } = usePopup();

    // Form state
    const [editForm, setEditForm] = useState({
        id: null,
        status: 'OPEN',
        quota: 150,
        price: 250000,
        internal_note: ''
    });

    useEffect(() => {
        fetchSchedules();
    }, [currentMonth]);

    useEffect(() => {
        // Update form when selected date changes
        const schedule = schedules.find(s => isSameDay(parseISO(s.hiking_date), selectedDate));
        if (schedule) {
            setEditForm({
                id: schedule.id,
                status: schedule.status,
                quota: 100, // Fixed to 100
                price: schedule.price,
                internal_note: schedule.internal_note || ''
            });
        } else {
            setEditForm({
                id: null,
                status: 'OPEN',
                quota: 100, // Fixed to 100
                price: 250000,
                internal_note: ''
            });
        }
    }, [selectedDate, schedules]);

    const fetchSchedules = async () => {
        setIsLoading(true);
        try {
            // Note: In a real app we might want to filter by month, but right now api gets all
            // Or we could pass query params, but currently backend /api/schedules just paginates.
            // Let's assume it gets the first page of 100 items for simplicity
            const response = await api.get('/schedules?limit=100');
            setSchedules(response.data.items);
        } catch (error) {
            console.error("Failed to fetch schedules:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const formattedDate = format(selectedDate, 'yyyy-MM-dd');
            const payload = {
                hiking_date: formattedDate,
                quota: 100, // Enforce fixed quota of 100
                price: Number(editForm.price),
                status: editForm.status,
                internal_note: editForm.internal_note
            };

            if (editForm.id) {
                // Update
                await api.put(`/schedules/${editForm.id}`, payload);
            } else {
                // Create
                await api.post('/schedules/', payload);
            }
            // Refresh
            await fetchSchedules();
            showPopup('Success', 'Schedule saved successfully!', 'success');
        } catch (error) {
            console.error("Failed to save schedule:", error.response?.data || error);
            showPopup('Error', `Error saving schedule: ${error.response?.data?.detail || error.message}`, 'error');
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const onDateClick = day => setSelectedDate(day);

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;
                const schedule = schedules.find(s => isSameDay(parseISO(s.hiking_date), cloneDay));
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                
                let dayClasses = "rounded-xl p-2 cursor-pointer transition-colors relative flex flex-col group shadow-sm min-h-[80px] ";
                
                if (!isCurrentMonth) {
                    dayClasses += "bg-surface-variant opacity-50 border border-transparent pointer-events-none";
                } else if (isSelected) {
                    dayClasses += "border-2 border-primary bg-primary/5 shadow-md";
                } else {
                    dayClasses += "border border-border hover:border-primary bg-surface";
                }

                days.push(
                    <div
                        className={dayClasses}
                        key={day}
                        onClick={() => isCurrentMonth && onDateClick(cloneDay)}
                    >
                        <span className={`text-sm font-bold ${isSelected ? 'text-primary' : (isCurrentMonth ? 'text-on-surface' : 'text-on-surface-variant')}`}>
                            {formattedDate}
                        </span>
                        
                        {isCurrentMonth && schedule && (
                            <div className="mt-auto flex flex-col gap-1 items-center">
                                <span className={`w-2 h-2 rounded-full ${schedule.status === 'CLOSED' ? 'bg-error' : (schedule.remaining_quota < 20 ? 'bg-warning' : 'bg-success')}`}></span>
                                <span className="text-[10px] font-semibold text-on-surface-variant">
                                    {schedule.status === 'CLOSED' ? 'Closed' : `${schedule.remaining_quota} left`}
                                </span>
                            </div>
                        )}
                        {isCurrentMonth && !schedule && (
                            <div className="mt-auto flex flex-col gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-semibold text-primary">Unset</span>
                            </div>
                        )}
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-2" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="flex-1 flex flex-col gap-2">{rows}</div>;
    };

    return (
        <div className="max-w-[1280px] mx-auto w-full flex flex-col gap-6 animate-fade-in">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-2 tracking-tight">Schedule & Quotas</h1>
                    <p className="text-base font-medium text-on-surface-variant">Manage daily availability, pricing, and operational status.</p>
                </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Calendar View (Main Content) */}
                <section className="lg:col-span-8 bg-surface rounded-2xl p-6 shadow-sm border border-border flex flex-col h-[650px]">
                    {/* Calendar Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-on-surface">{format(currentMonth, 'MMMM yyyy')}</h3>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface transition-colors border border-border">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface transition-colors border border-border">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-on-surface-variant mb-2">
                        <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                    </div>
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-primary">
                             <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
                        </div>
                    ) : (
                        renderCells()
                    )}
                </section>

                {/* Daily Editor (Right Sidebar on Desktop) */}
                <section className="lg:col-span-4 bg-surface rounded-2xl p-6 shadow-sm border border-border flex flex-col h-[650px]">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined">edit_calendar</span>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-on-surface">Edit Selected Date</h3>
                            <p className="text-xs text-primary font-bold">{format(selectedDate, 'MMMM d, yyyy')}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                        {/* Status Toggle */}
                        <div className="flex items-center justify-between bg-surface-variant/30 p-4 rounded-xl border border-border">
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-1">Operational Status</label>
                                <span className="text-xs font-medium text-on-surface-variant">
                                    {editForm.status === 'OPEN' ? 'Currently accepting bookings' : 'Currently closed'}
                                </span>
                            </div>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={editForm.status === 'OPEN'}
                                        onChange={(e) => setEditForm({...editForm, status: e.target.checked ? 'OPEN' : 'CLOSED'})}
                                    />
                                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>

                        {/* Quota Input */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-2">Daily Visitor Quota</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[20px]">groups</span>
                                </span>
                                <input 
                                    className="w-full h-14 pl-10 pr-4 bg-surface-variant border border-border text-on-surface-variant rounded-xl cursor-not-allowed focus:outline-none text-sm font-medium" 
                                    type="number" 
                                    value={100}
                                    readOnly
                                />
                            </div>
                            <p className="text-xs font-medium text-on-surface-variant mt-1">Quota is fixed at 100 hikers per day.</p>
                        </div>

                        {/* Price Editor */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-2">Base Price (IDR)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant font-semibold">
                                    Rp
                                </span>
                                <input 
                                    className="w-full h-14 pl-10 pr-4 bg-surface border border-border text-on-surface rounded-xl focus:border-primary focus:border-2 focus:ring-0 focus:outline-none transition-all text-sm font-medium" 
                                    type="number" 
                                    value={editForm.price}
                                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Note/Reason */}
                        <div>
                            <label className="block text-xs font-bold text-on-surface mb-2">Internal Note (Optional)</label>
                            <textarea 
                                className="w-full p-3 bg-surface border border-border text-on-surface rounded-xl focus:border-primary focus:border-2 focus:ring-0 focus:outline-none transition-all text-sm font-medium resize-none h-24" 
                                placeholder="e.g., Trail maintenance, peak season pricing..."
                                value={editForm.internal_note}
                                onChange={(e) => setEditForm({...editForm, internal_note: e.target.value})}
                            ></textarea>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-border flex gap-3 mt-auto">
                        <button className="flex-1 bg-surface border border-border text-on-surface rounded-xl py-3 text-sm font-bold hover:bg-surface-variant transition-colors" onClick={() => fetchSchedules()}>
                            Revert
                        </button>
                        <button 
                            className="flex-1 bg-primary text-white rounded-xl py-3 text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
                            onClick={handleSave}
                        >
                            Save Changes
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminScheduleManagement;

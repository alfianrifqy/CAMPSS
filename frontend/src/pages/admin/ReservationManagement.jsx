import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePopup } from '../../context/PopupContext';
import api from '../../services/api';
import Pagination from '../../components/Pagination';

const AdminReservationManagement = () => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showPopup, showConfirm } = usePopup();
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Pagination
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // Reset offset when filters change
    useEffect(() => {
        setOffset(0);
    }, [searchQuery, statusFilter, limit]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchReservations();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [offset, limit, searchQuery, statusFilter]);

    const fetchReservations = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                limit,
                offset
            });
            if (searchQuery) params.append('search', searchQuery);
            if (statusFilter) params.append('status', statusFilter);

            const response = await api.get(`/reservations/?${params.toString()}`);
            setReservations(response.data.items || response.data);
            setTotalCount(response.data.count || (response.data.items ? response.data.items.length : response.data.length));
        } catch (error) {
            console.error("Failed to fetch reservations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id) => {
        showConfirm(
            "Cancel & Delete", 
            "Are you sure you want to cancel and delete this reservation? The quota will be refunded.", 
            async () => {
                try {
                    await api.delete(`/reservations/${id}`);
                    fetchReservations();
                    showPopup("Success", "Reservation deleted successfully.", "success");
                } catch (error) {
                    console.error("Failed to delete reservation:", error);
                    showPopup("Error", "Error deleting reservation.", "error");
                }
            }
        );
    };

    // We no longer filter on the frontend since it's done on the server
    const filteredReservations = reservations;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return "bg-warning/20 text-[#8B6000]";
            case 'PAID':
                return "bg-primary/20 text-primary";
            case 'APPROVED': // Optional based on future changes
                return "bg-success/20 text-[#1B5E20]";
            case 'CANCELLED':
                return "bg-error/20 text-error";
            case 'COMPLETED':
                return "bg-success/20 text-success";
            default:
                return "bg-surface-variant text-on-surface-variant";
        }
    };

    const handleExportCSV = () => {
        const headers = ["Booking Code", "Leader Name", "Created At", "Members", "Payment Status", "Check-in Status"];
        const rows = filteredReservations.map(res => [
            res.booking_code,
            res.leader_name,
            res.created_at ? format(parseISO(res.created_at), 'yyyy-MM-dd') : 'N/A',
            res.total_members,
            res.status,
            res.checkin_status
        ]);
        
        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reservations_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(27, 94, 32); // Primary Green
        doc.text("CAMPSS - Reservation Report", 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${format(new Date(), 'dd MMMM yyyy HH:mm')}`, 14, 32);
        doc.text(`Total Records: ${filteredReservations.length}`, 14, 38);
        
        // Table Data
        const tableColumn = ["Booking Code", "Leader Name", "Created At", "Members", "Payment", "Check-in"];
        const tableRows = [];

        filteredReservations.forEach(res => {
            const rowData = [
                res.booking_code,
                res.leader_name,
                res.created_at ? format(parseISO(res.created_at), 'dd MMM yyyy') : 'N/A',
                res.total_members.toString(),
                res.status.replace('_', ' '),
                res.checkin_status
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            headStyles: { fillColor: [27, 94, 32], textColor: 255, fontSize: 10, fontStyle: 'bold' },
            bodyStyles: { fontSize: 10, cellPadding: 4 },
            alternateRowStyles: { fillColor: [248, 250, 248] },
            margin: { top: 45 }
        });
        
        doc.save(`CAMPSS_Reservations_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
    };

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">Reservation Management</h1>
                    <p className="text-base font-medium text-on-surface-variant print-hide">View and manage all upcoming hike bookings.</p>
                </div>
                <div className="flex gap-4 print-hide">
                    <button onClick={handleExportCSV} className="px-4 py-2 border-[1.5px] border-primary text-primary font-bold text-sm rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">download</span> Export CSV
                    </button>
                    <button onClick={handleExportPDF} className="px-4 py-2 border-[1.5px] border-primary text-primary font-bold text-sm rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span> Export PDF
                    </button>
                </div>
            </div>

            {/* Controls & Filters Bar */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                    <input 
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium h-12" 
                        placeholder="Search by booking code or name..." 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex w-full md:w-auto gap-4 overflow-x-auto pb-2 md:pb-0">
                    <div className="relative">
                        <select 
                            className="border border-border rounded-xl px-4 py-3 h-12 text-sm font-medium text-on-surface focus:border-primary outline-none bg-transparent appearance-none pr-10 min-w-[140px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING_PAYMENT">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Data Table Container */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-surface-variant border-b border-border">
                                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Booking Code</th>
                                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">User Name</th>
                                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Created At</th>
                                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Members</th>
                                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Check-in</th>
                                <th className="p-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-on-surface-variant font-medium">
                                        Loading reservations...
                                    </td>
                                </tr>
                            ) : filteredReservations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-on-surface-variant font-medium">
                                        No reservations found.
                                    </td>
                                </tr>
                            ) : (
                                filteredReservations.map(res => (
                                    <tr key={res.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="p-4 text-sm font-bold text-on-surface">{res.booking_code}</td>
                                        <td className="p-4 text-sm font-medium text-on-surface">{res.leader_name}</td>
                                        <td className="p-4 text-sm font-medium text-on-surface-variant">
                                            {res.created_at ? format(parseISO(res.created_at), 'MMM d, yyyy') : 'N/A'}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-on-surface-variant">{res.total_members}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusStyle(res.status)}`}>
                                                {res.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                res.checkin_status === 'NOT ARRIVED' ? 'bg-surface-variant text-on-surface-variant' : 
                                                res.checkin_status === 'HIKING' ? 'bg-warning/20 text-[#8B6000]' :
                                                'bg-success/20 text-success'
                                            }`}>
                                                {res.checkin_status === 'HIKING' && <span className="material-symbols-outlined text-[12px] mr-1">hiking</span>}
                                                {res.checkin_status === 'CHECKED OUT' && <span className="material-symbols-outlined text-[12px] mr-1">home</span>}
                                                {res.checkin_status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                className="text-on-surface-variant hover:text-error transition-colors" 
                                                title="Delete"
                                                onClick={() => handleDelete(res.id)}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    totalCount={totalCount}
                    limit={limit}
                    offset={offset}
                    onPageChange={setOffset}
                />
            </div>
        </div>
    );
};

export default AdminReservationManagement;

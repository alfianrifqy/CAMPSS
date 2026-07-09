import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../../services/api';

const AdminCheckInReport = () => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await api.get('/checkins/report');
                setReports(response.data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 text-primary">
                <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface mb-2">Check-In Reports</h1>
                    <p className="text-on-surface-variant font-medium">Track all hiker entries and exits from the basecamp.</p>
                </div>
            </div>

            <div className="bg-surface rounded-3xl shadow-sm border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low border-b border-border">
                                <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Booking & Leader</th>
                                <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Ticket Number</th>
                                <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Check-In Time</th>
                                <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Check-Out Time</th>
                                <th className="px-6 py-4 text-xs font-extrabold text-on-surface-variant uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">data_alert</span>
                                        <p className="font-medium">No check-in data available.</p>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report, idx) => (
                                    <tr key={idx} className="hover:bg-surface-variant/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs text-primary font-bold mb-1">{report.booking_code}</div>
                                            <div className="font-semibold text-on-surface text-sm">{report.leader_name}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">
                                            {report.ticket_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-on-surface">
                                                {format(new Date(report.checked_in_at), 'dd MMM yyyy')}
                                            </div>
                                            <div className="text-xs text-on-surface-variant font-medium mt-1 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                {format(new Date(report.checked_in_at), 'HH:mm')}
                                            </div>
                                            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">by {report.checked_in_by}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {report.checked_out_at ? (
                                                <>
                                                    <div className="text-sm font-semibold text-on-surface">
                                                        {format(new Date(report.checked_out_at), 'dd MMM yyyy')}
                                                    </div>
                                                    <div className="text-xs text-on-surface-variant font-medium mt-1 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                        {format(new Date(report.checked_out_at), 'HH:mm')}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-xs font-medium text-on-surface-variant italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex w-fit items-center gap-1 ${
                                                report.status === 'COMPLETED' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                            }`}>
                                                <span className="material-symbols-outlined text-[16px]">{report.status === 'COMPLETED' ? 'done_all' : 'hiking'}</span>
                                                {report.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCheckInReport;

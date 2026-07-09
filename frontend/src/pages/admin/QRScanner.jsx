import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';

const AdminQRScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
                fps: 10,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    // If image is very large (likely an uploaded screenshot), scan the whole image
                    if (viewfinderWidth > 1000 || viewfinderHeight > 1000) {
                        return { width: viewfinderWidth, height: viewfinderHeight };
                    }
                    // For camera feeds, use a 70% square in the center
                    const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
                    const qrboxSize = Math.floor(minEdgeSize * 0.7);
                    return { width: qrboxSize, height: qrboxSize };
                }
            },
            false
        );
        scannerRef.current = scanner;

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, []);

    const onScanSuccess = async (decodedText, decodedResult) => {
        // Pause scanner to prevent multiple calls
        if (scannerRef.current) {
            scannerRef.current.pause();
        }
        
        setIsLoading(true);
        setScanError(null);
        setScanResult(null);

        try {
            const response = await api.post('/checkins/scan', {
                ticket_number: decodedText
            });
            setScanResult({
                success: true,
                message: response.data.message,
                action: response.data.action,
                ticket_number: decodedText
            });
        } catch (error) {
            console.error("Scan API Error:", error);
            setScanError({
                message: error.response?.data?.detail || "Failed to verify ticket"
            });
        } finally {
            setIsLoading(false);
            // Resume after 3 seconds
            setTimeout(() => {
                if (scannerRef.current) {
                    scannerRef.current.resume();
                }
            }, 3000);
        }
    };

    const onScanFailure = (error) => {
        // handle scan failure, usually better to ignore and keep scanning.
    };

    return (
        <div className="animate-fade-in space-y-6 max-w-5xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-extrabold text-on-surface mb-2">QR Code Scanner</h1>
                <p className="text-on-surface-variant font-medium">Scan hiker tickets to process check-in or check-out.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Scanner Container */}
                <div className="bg-surface p-6 rounded-3xl shadow-sm border border-border flex flex-col items-center">
                    <div id="qr-reader" className="w-full relative overflow-hidden rounded-2xl"></div>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-on-surface-variant bg-surface-container py-2 px-4 rounded-full w-fit">
                        <span className="material-symbols-outlined text-primary">center_focus_strong</span>
                        Position QR code inside the frame
                    </div>
                </div>

                {/* Status Container */}
                <div className="flex flex-col gap-6 h-full">
                    <div className="bg-surface p-8 rounded-3xl shadow-sm border border-border flex-1 flex flex-col items-center justify-center min-h-[400px] transition-all duration-300">
                        {isLoading && (
                            <div className="flex flex-col items-center text-primary animate-pulse">
                                <span className="material-symbols-outlined animate-spin text-6xl mb-6">progress_activity</span>
                                <p className="font-bold text-lg tracking-wide">Verifying ticket...</p>
                            </div>
                        )}

                        {!isLoading && !scanResult && !scanError && (
                            <div className="flex flex-col items-center text-on-surface-variant/40">
                                <span className="material-symbols-outlined text-[100px] mb-6 drop-shadow-sm">qr_code_scanner</span>
                                <p className="font-bold text-xl tracking-tight">Ready to scan</p>
                                <p className="text-sm font-medium mt-2">Waiting for scanner input...</p>
                            </div>
                        )}

                        {!isLoading && scanResult && (
                            <div className="flex flex-col items-center text-center animate-fade-in w-full">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 ${scanResult.action === 'checkin' ? 'bg-success/10 text-success border-success/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                    <span className="material-symbols-outlined text-[48px]">
                                        {scanResult.action === 'checkin' ? 'how_to_reg' : 'output'}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-extrabold text-on-surface mb-3">Verified!</h2>
                                <p className="text-on-surface-variant font-medium mb-8 text-lg">{scanResult.message}</p>
                                
                                <div className="bg-surface-variant/50 w-full px-6 py-4 rounded-2xl border border-border">
                                    <span className="text-xs uppercase font-extrabold text-on-surface-variant block mb-1 tracking-wider">Ticket Number</span>
                                    <span className="font-mono font-bold text-primary text-xl tracking-tight">{scanResult.ticket_number}</span>
                                </div>
                            </div>
                        )}

                        {!isLoading && scanError && (
                            <div className="flex flex-col items-center text-center animate-fade-in w-full">
                                <div className="w-24 h-24 rounded-full bg-error/10 text-error flex items-center justify-center mb-6 border-4 border-error/20 shadow-sm">
                                    <span className="material-symbols-outlined text-[48px]">error</span>
                                </div>
                                <h2 className="text-3xl font-extrabold text-on-surface mb-3">Scan Failed</h2>
                                <p className="text-error font-medium text-lg bg-error/5 px-6 py-4 rounded-2xl border border-error/10 w-full">{scanError.message}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                /* Override html5-qrcode ugly styles */
                #qr-reader {
                    border: none !important;
                    background: transparent;
                }
                
                #qr-reader__dashboard_section_csr span {
                    font-family: 'Inter', sans-serif !important;
                    font-size: 15px;
                    font-weight: 500;
                    color: #4B5563;
                    margin-bottom: 16px;
                    display: block;
                }
                
                #qr-reader button {
                    background-color: #1B5E20 !important;
                    color: white !important;
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                    font-weight: 700 !important;
                    font-size: 14px;
                    padding: 12px 24px !important;
                    border-radius: 12px !important;
                    border: none !important;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 4px 16px rgba(0,0,0,.06);
                    margin: 8px 0;
                    width: 100%;
                    max-width: 250px;
                }
                
                #qr-reader button:hover {
                    background-color: #2E7D32 !important;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(0,0,0,.1);
                }
                
                #qr-reader a {
                    color: #1B5E20 !important;
                    text-decoration: none !important;
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 600 !important;
                    font-size: 14px;
                    padding: 8px;
                    display: inline-block;
                }
                
                #qr-reader a:hover {
                    text-decoration: underline !important;
                    opacity: 0.8;
                }
                
                #qr-reader select {
                    padding: 12px 16px !important;
                    border-radius: 12px !important;
                    border: 1px solid #E5E7EB !important;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 16px;
                    width: 100%;
                    background-color: #F8FAF8;
                    color: #1F2937;
                    outline: none;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
                }
                
                #qr-reader select:focus {
                    border-color: #1B5E20 !important;
                    box-shadow: 0 0 0 1px #1B5E20;
                }
                
                #qr-reader__scan_region {
                    background: #111;
                    border-radius: 20px;
                    overflow: hidden;
                    margin-top: 16px;
                }
                
                #qr-reader video {
                    object-fit: cover;
                    border-radius: 20px !important;
                }
                
                #qr-reader__dashboard_section_swaplink {
                    margin-top: 16px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default AdminQRScanner;

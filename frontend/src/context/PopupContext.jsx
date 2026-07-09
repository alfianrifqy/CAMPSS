import React, { createContext, useContext, useState } from 'react';

const PopupContext = createContext(null);

export const usePopup = () => {
    return useContext(PopupContext);
};

export const PopupProvider = ({ children }) => {
    const [popupState, setPopupState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // 'success', 'error', 'warning', 'info'
        isConfirm: false,
        onConfirm: null,
    });

    const showPopup = (title, message, type = 'info') => {
        setPopupState({
            isOpen: true,
            title,
            message,
            type,
            isConfirm: false,
            onConfirm: null
        });
    };

    const showConfirm = (title, message, onConfirm) => {
        setPopupState({
            isOpen: true,
            title,
            message,
            type: 'warning',
            isConfirm: true,
            onConfirm
        });
    };

    const closePopup = () => {
        setPopupState(prev => ({ ...prev, isOpen: false }));
    };

    const handleConfirmClick = () => {
        if (popupState.onConfirm) {
            popupState.onConfirm();
        }
        closePopup();
    };

    const getTypeStyles = () => {
        switch (popupState.type) {
            case 'success':
                return { icon: 'check_circle', iconColor: 'text-success', bgColor: 'bg-success/20', btnBg: 'bg-success hover:bg-success/90' };
            case 'error':
                return { icon: 'error', iconColor: 'text-error', bgColor: 'bg-error/20', btnBg: 'bg-error hover:bg-error/90' };
            case 'warning':
                return { icon: 'warning', iconColor: 'text-[#8B6000]', bgColor: 'bg-warning/20', btnBg: 'bg-primary hover:bg-primary/90' };
            default:
                return { icon: 'info', iconColor: 'text-primary', bgColor: 'bg-primary/20', btnBg: 'bg-primary hover:bg-primary/90' };
        }
    };

    const styles = getTypeStyles();

    return (
        <PopupContext.Provider value={{ showPopup, showConfirm }}>
            {children}
            
            {popupState.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border/50 flex flex-col items-center text-center transform scale-100 transition-transform">
                        <div className={`w-20 h-20 rounded-full ${styles.bgColor} flex items-center justify-center mb-6 shadow-inner`}>
                            <span className={`material-symbols-outlined text-4xl ${styles.iconColor}`}>
                                {styles.icon}
                            </span>
                        </div>
                        
                        <h3 className="text-2xl font-extrabold text-on-surface mb-3 tracking-tight">
                            {popupState.title}
                        </h3>
                        
                        <p className="text-sm md:text-base font-medium text-on-surface-variant mb-8 leading-relaxed">
                            {popupState.message}
                        </p>
                        
                        {popupState.isConfirm ? (
                            <div className="flex gap-4 w-full">
                                <button 
                                    onClick={closePopup}
                                    className="flex-1 bg-surface-variant text-on-surface-variant font-bold py-3.5 rounded-2xl hover:bg-surface-variant/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleConfirmClick}
                                    className={`flex-1 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-md ${styles.btnBg}`}
                                >
                                    Confirm
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={closePopup}
                                className={`w-full text-white font-bold py-3.5 rounded-2xl transition-colors shadow-md ${styles.btnBg}`}
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            )}
        </PopupContext.Provider>
    );
};

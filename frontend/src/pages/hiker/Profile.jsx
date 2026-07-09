import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { usePopup } from '../../context/PopupContext';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        phone: '',
        nik: '',
        emergency_name: '',
        emergency_phone: '',
        profile_picture: null,
        identity_photo: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [previewIdentity, setPreviewIdentity] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedIdentity, setSelectedIdentity] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { showPopup } = usePopup();
    
    const fileInputRef = useRef(null);
    const identityInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                setProfile({
                    full_name: response.data.full_name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    nik: response.data.nik || '',
                    emergency_name: response.data.emergency_name || '',
                    emergency_phone: response.data.emergency_phone || '',
                    profile_picture: response.data.profile_picture || null,
                    identity_photo: response.data.identity_photo || null
                });
                if (response.data.profile_picture) {
                    setPreviewImage(response.data.profile_picture);
                }
                if (response.data.identity_photo) {
                    setPreviewIdentity(response.data.identity_photo);
                }
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleIdentityChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedIdentity(file);
            setPreviewIdentity(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('full_name', profile.full_name);
            formData.append('email', profile.email);
            formData.append('phone', profile.phone);
            formData.append('nik', profile.nik);
            formData.append('emergency_name', profile.emergency_name);
            formData.append('emergency_phone', profile.emergency_phone);
            
            if (selectedFile) {
                formData.append('profile_picture', selectedFile);
            }
            if (selectedIdentity) {
                formData.append('identity_photo', selectedIdentity);
            }
            
            await api.put('/auth/me', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            window.dispatchEvent(new Event('profileUpdated'));
            showPopup('Success', 'Profile updated successfully!', 'success');
        } catch (error) {
            console.error("Failed to update profile", error);
            showPopup('Error', 'Failed to update profile. ' + (error.response?.data?.message || ''), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Split full name into first and last name for the UI, but store as one in backend.
    const nameParts = profile.full_name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const handleFirstNameChange = (e) => {
        const newFirst = e.target.value;
        setProfile(prev => ({
            ...prev,
            full_name: `${newFirst} ${lastName}`.trim()
        }));
    };

    const handleLastNameChange = (e) => {
        const newLast = e.target.value;
        setProfile(prev => ({
            ...prev,
            full_name: `${firstName} ${newLast}`.trim()
        }));
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center text-primary h-screen">
                 <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="max-w-[1280px] mx-auto flex flex-col gap-10 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight">Account Profile</h1>
                <p className="text-lg font-medium text-on-surface-variant">Manage your personal information, security settings, and notification preferences.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Personal Info */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Personal Information Card */}
                    <section className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                            <span className="material-symbols-outlined text-primary">person</span>
                            <h2 className="text-xl font-bold text-on-surface">Personal Information</h2>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="w-32 h-32 rounded-full shadow-sm border-2 border-border object-cover" />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full shadow-sm border-2 border-border bg-primary/10 flex items-center justify-center text-primary text-5xl font-bold uppercase">
                                            {firstName.charAt(0)}{lastName.charAt(0)}
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                        className="hidden" 
                                        accept="image/jpeg, image/png" 
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="absolute bottom-0 right-0 bg-surface rounded-full p-2 shadow-sm border border-border hover:bg-surface-variant transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-on-surface text-sm">edit</span>
                                    </button>
                                </div>
                                <span className="text-xs font-semibold text-on-surface-variant">JPG or PNG under 2MB</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-bold text-on-surface-variant">First Name</label>
                                        <input 
                                            className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-medium outline-none" 
                                            type="text" 
                                            value={firstName}
                                            onChange={handleFirstNameChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-bold text-on-surface-variant">Last Name</label>
                                        <input 
                                            className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-medium outline-none" 
                                            type="text" 
                                            value={lastName}
                                            onChange={handleLastNameChange}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold text-on-surface-variant">Email Address</label>
                                    <input 
                                        className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-medium outline-none" 
                                        type="email" 
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold text-on-surface-variant">Phone Number</label>
                                    <input 
                                        className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-medium outline-none" 
                                        type="tel" 
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button className="px-6 py-2 rounded-xl text-sm font-bold text-primary border border-primary hover:bg-primary/5 transition-colors">Discard</button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary text-white rounded-xl px-6 py-2 text-sm font-bold shadow-sm hover:shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </section>

                    {/* Identity & Emergency Info Card */}
                    <section className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                            <span className="material-symbols-outlined text-primary">badge</span>
                            <h2 className="text-xl font-bold text-on-surface">Identity & Emergency Contact</h2>
                        </div>
                        
                        <div className="flex flex-col gap-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold text-on-surface-variant">Identity ID (NIK/Passport)</label>
                                    <input 
                                        className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-medium outline-none" 
                                        type="text" 
                                        name="nik"
                                        placeholder="Enter ID number"
                                        value={profile.nik}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold text-on-surface-variant">Emergency Contact Name</label>
                                    <input 
                                        className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-medium outline-none" 
                                        type="text" 
                                        name="emergency_name"
                                        placeholder="e.g. Jane Doe (Wife)"
                                        value={profile.emergency_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-bold text-on-surface-variant">Emergency Phone Number</label>
                                    <input 
                                        className="w-full h-12 px-3 rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-medium outline-none" 
                                        type="tel" 
                                        name="emergency_phone"
                                        placeholder="+62 812 3456 7890"
                                        value={profile.emergency_phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-bold text-on-surface-variant">Identity Document Photo (KTP)</label>
                                {previewIdentity ? (
                                    <div className="relative w-full max-w-sm h-48 rounded-xl border-2 border-border overflow-hidden">
                                        <img src={previewIdentity} alt="Identity" className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => identityInputRef.current.click()}
                                            className="absolute bottom-2 right-2 bg-surface rounded-full p-2 shadow-md hover:bg-surface-variant transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-on-surface text-sm">edit</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => identityInputRef.current.click()}
                                        className="w-full max-w-sm h-48 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all group"
                                    >
                                        <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors">add_photo_alternate</span>
                                        <span className="text-sm font-semibold text-on-surface-variant group-hover:text-primary transition-colors">Upload Identity Photo</span>
                                        <span className="text-xs font-medium text-on-surface-variant/70">Format: JPG, PNG (Max 2MB)</span>
                                    </button>
                                )}
                                <input 
                                    type="file" 
                                    ref={identityInputRef} 
                                    onChange={handleIdentityChange} 
                                    className="hidden" 
                                    accept="image/jpeg, image/png" 
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button className="px-6 py-2 rounded-xl text-sm font-bold text-primary border border-primary hover:bg-primary/5 transition-colors">Discard</button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary text-white rounded-xl px-6 py-2 text-sm font-bold shadow-sm hover:shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </section>
                </div>
                {/* Right Column: Preferences */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Account Security Card */}
                    <section className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                            <span className="material-symbols-outlined text-primary">lock</span>
                            <h2 className="text-xl font-bold text-on-surface">Account Security</h2>
                        </div>
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-on-surface-variant">Current Password</label>
                                <input className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-medium outline-none" placeholder="••••••••" type="password" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-bold text-on-surface-variant">New Password</label>
                                <input className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-sm font-medium outline-none" placeholder="Min. 8 characters" type="password" />
                            </div>
                        </div>
                        <button className="w-full bg-primary/10 text-primary rounded-xl px-6 py-2 text-sm font-bold hover:bg-primary/20 transition-colors">Update Password</button>
                    </section>

                    {/* Notification Preferences */}
                    <section className="bg-surface rounded-2xl p-6 shadow-sm border border-border">
                        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            <h2 className="text-xl font-bold text-on-surface">Preferences</h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-on-surface">Booking Updates</div>
                                    <div className="text-xs font-medium text-on-surface-variant">Confirmation and reminders.</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input defaultChecked className="sr-only peer" type="checkbox" value="" />
                                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <hr className="border-border" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-on-surface">Weather Alerts</div>
                                    <div className="text-xs font-medium text-on-surface-variant">Crucial updates for your scheduled hikes.</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input defaultChecked className="sr-only peer" type="checkbox" value="" />
                                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

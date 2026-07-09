import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="bg-background text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm transition-all duration-300">
                <div className="flex justify-between items-center px-6 md:px-12 h-20 max-w-[1280px] mx-auto w-full relative">
                    <Link to="/" className="text-3xl font-extrabold text-primary tracking-tight z-10">CAMPSS</Link>
                    
                    <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                        <a className="text-primary font-bold border-b-2 border-primary pb-1 text-sm md:text-base opacity-90 transition-all" href="#">Explore</a>
                        <a className="text-on-surface-variant font-medium text-sm md:text-base hover:text-primary transition-colors duration-200" href="#about">About</a>
                        <a className="text-on-surface-variant font-medium text-sm md:text-base hover:text-primary transition-colors duration-200" href="#">Contact</a>
                    </div>
                    
                    <div className="flex items-center gap-4 z-10">
                        <Link to="/login" className="hidden md:flex items-center justify-center bg-primary text-white rounded-full px-6 py-2.5 font-bold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">Sign In</Link>
                        <button className="md:hidden text-on-surface"><span className="material-symbols-outlined">menu</span></button>
                    </div>
                </div>
            </nav>

            <main className="pt-20">
                {/* Hero Section */}
                <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center w-full h-full" data-alt="Mount Prau" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAA6mkeHpOspw0eHZIgmNoyVlGnULo_e0HAULA0ILM3cOdXpYSzs1P5hAspj-WeT7Ob7KmZe8CeJkpZRtHQd9HQgKm56fgl64X5tVM6PuU7BKQbp9NoYkQxVwsG5wYrvzi0fRE_A40wnEdr2OAw2ER_30llakGpK63kGcv-_GZSUB3pfHcbiWosImWP8GZ7JpmiVTMh3X8-TP_CjZdJPCV5GfWybWyS1LdkG61Ns-hvT5xzGssMpjsuBPoKkzoSwbU_yXIL9jkReO2f')"}}></div>
                    <div className="absolute inset-0" style={{background: "linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%)"}}></div>
                    
                    <div className="relative z-10 text-center px-6 md:px-12 max-w-[800px] mx-auto flex flex-col items-center gap-6">
                        <h1 className="text-4xl md:text-6xl text-white font-extrabold leading-tight">Your Journey to the Summit Starts Here</h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-[600px] font-medium">Experience Mount Prau with CAMPSS. Streamlined reservations, real-time updates, and everything you need for a seamless adventure.</p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6 w-full">
                            <Link to="/login" className="bg-primary text-white font-bold px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">Reserve Now</Link>
                            <a href="#about" className="border-2 border-white text-white font-bold px-8 py-3.5 rounded-full hover:bg-white hover:text-black transition-all">Learn More</a>
                        </div>
                    </div>
                </section>

                {/* About Section (Bento Grid) */}
                <section id="about" className="py-24 px-6 md:px-12 max-w-[1280px] mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">About CAMPSS</h2>
                        <p className="text-lg text-on-surface-variant max-w-[600px] mx-auto">Elevating your outdoor experience through smart hospitality.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-surface rounded-2xl p-8 shadow-sm border border-border flex flex-col justify-center hover:shadow-md transition-shadow">
                            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-primary">
                                <span className="material-symbols-outlined text-[28px]">nature_people</span>
                            </div>
                            <h3 className="text-2xl font-bold text-on-surface mb-3">Sustainable Exploration</h3>
                            <p className="text-on-surface-variant leading-relaxed">We manage visitor quotas to protect the fragile ecosystem of Mount Prau, ensuring that its natural beauty remains pristine for generations to come. Every booking helps us maintain the trails and facilities.</p>
                        </div>
                        
                        <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
                            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-primary">
                                <span className="material-symbols-outlined text-[28px]">verified_user</span>
                            </div>
                            <h3 className="text-2xl font-bold text-on-surface mb-3">Safety First</h3>
                            <p className="text-on-surface-variant leading-relaxed">Real-time weather updates and mandatory check-ins keep you safe on the trail at all times.</p>
                        </div>
                        
                        <div className="bg-surface rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow">
                            <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-primary">
                                <span className="material-symbols-outlined text-[28px]">bolt</span>
                            </div>
                            <h3 className="text-2xl font-bold text-on-surface mb-3">Instant Booking</h3>
                            <p className="text-on-surface-variant leading-relaxed">Skip the queues with our seamless digital reservation system and Midtrans payment gateway.</p>
                        </div>
                        
                        <div className="md:col-span-2 relative overflow-hidden rounded-2xl shadow-sm border border-border min-h-[300px]">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15833.348484410286!2d109.9539897092802!3d-7.202324434849635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7073001d528303%3A0xc68a2ad2010bb42a!2sPRAU%20VIA%20CAMPUREJO!5e0!3m2!1sid!2sid!4v1782646004231!5m2!1sid!2sid" 
                                className="absolute inset-0 w-full h-full border-0 transition-all duration-500"
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Mount Prau Location Map"
                            ></iframe>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-12 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 bg-surface border-t border-border mt-10">
                <div className="text-2xl font-extrabold text-primary">CAMPSS</div>
                <div className="flex flex-wrap justify-center gap-6">
                    <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-all" href="#">Privacy Policy</a>
                    <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-all" href="#">Terms of Service</a>
                    <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-all" href="#">Park Rules</a>
                    <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-all" href="#">Contact Support</a>
                </div>
                <div className="text-sm text-on-surface-variant">© 2026 Campurejo Smart System.</div>
            </footer>
        </div>
    );
};

export default LandingPage;

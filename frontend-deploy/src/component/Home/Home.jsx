import React from 'react';
import { useNavigate } from 'react-router-dom';
import image from "../../assets/landing1.jpg";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${image})` }}
            >
                {/* Very subtle overlay only where text is */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-20"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex items-center min-h-screen px-6 sm:px-12 lg:px-20">
                <div className="max-w-4xl">
                    {/* Main Content Card */}
                    <div className="bg-gradient-to-r from-blue-600/90 via-blue-700/85 to-blue-800/90 backdrop-blur-lg rounded-3xl p-8 sm:p-12 border border-blue-300/20 shadow-2xl">
                        <div className="text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center px-4 py-2 mb-6 bg-rose-500/20 backdrop-blur-sm rounded-full border border-rose-300/40">
                                <span className="text-rose-50 font-medium text-sm tracking-wide">
                                    🐾 Welcome to PetSphere
                                </span>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                                <span className="bg-gradient-to-r from-rose-300 via-pink-300 to-fuchsia-300 bg-clip-text text-transparent">Find Your</span>
                                <span className="block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                                    Perfect Companion
                                </span>
                            </h1>

                            {/* Subheading */}
                            <p className="text-lg sm:text-xl lg:text-2xl mb-8 max-w-2xl leading-relaxed font-light opacity-90">
                                <span className="bg-gradient-to-r from-rose-100 via-pink-100 to-fuchsia-100 bg-clip-text text-transparent">
                                    Connect with loving pets waiting for their forever homes. Join thousands of pet lovers in our caring community.
                                </span>
                            </p>

                            {/* Features List */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl">
                                <div className="flex items-center space-x-3 bg-rose-500/10 backdrop-blur-sm rounded-2xl p-3 border border-rose-200/30">
                                    <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white text-sm font-bold">🏠</span>
                                    </div>
                                    <span className="bg-gradient-to-r from-rose-200 to-pink-100 bg-clip-text text-transparent font-medium">Adopt New Pets</span>
                                </div>
                                <div className="flex items-center space-x-3 bg-rose-500/10 backdrop-blur-sm rounded-2xl p-3 border border-rose-200/30">
                                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white text-sm font-bold">🔍</span>
                                    </div>
                                    <span className="bg-gradient-to-r from-pink-200 to-rose-100 bg-clip-text text-transparent font-medium">Find Lost Pets</span>
                                </div>
                                <div className="flex items-center space-x-3 bg-rose-500/10 backdrop-blur-sm rounded-2xl p-3 border border-rose-200/30">
                                    <div className="w-8 h-8 bg-fuchsia-500 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white text-sm font-bold">⭐</span>
                                    </div>
                                    <span className="bg-gradient-to-r from-fuchsia-200 to-pink-100 bg-clip-text text-transparent font-medium">Track Pet Information</span>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center text-center">
                                <button 
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-500 via-pink-600 to-fuchsia-600 hover:from-rose-600 hover:via-pink-700 hover:to-fuchsia-700 text-white font-semibold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg"
                                    onClick={() => navigate('/login')}
                                >
                                    Get Started Today
                                    <span className="ml-2">→</span>
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="mt-12 pt-8 border-t border-blue-200/30">
                                <div className="grid grid-cols-3 gap-8 max-w-lg">
                                    <div className="text-left">
                                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">300+</div>
                                        <div className="bg-gradient-to-r from-rose-200 to-pink-100 bg-clip-text text-transparent text-sm font-medium opacity-80">Happy Pets</div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 to-fuchsia-500 bg-clip-text text-transparent">200+</div>
                                        <div className="bg-gradient-to-r from-pink-200 to-rose-100 bg-clip-text text-transparent text-sm font-medium opacity-80">Active Users</div>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-fuchsia-400 to-rose-500 bg-clip-text text-transparent">100%</div>
                                        <div className="bg-gradient-to-r from-fuchsia-200 to-pink-100 bg-clip-text text-transparent text-sm font-medium opacity-80">Built with ❤️</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 right-10 w-4 h-4 bg-orange-400 rounded-full opacity-60 animate-bounce"></div>
            <div className="absolute top-40 right-32 w-6 h-6 bg-pink-400 rounded-full opacity-40 animate-pulse"></div>
            <div className="absolute bottom-32 left-10 w-5 h-5 bg-purple-400 rounded-full opacity-50 animate-bounce delay-1000"></div>
        </div>
    );
};

export default Home;

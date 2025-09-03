import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../provider/Authprovider';
import { getPetImageUrl, handleImageError } from '../../utils/imageUtils';
import '../AdminCSS/AdminHome.css';
import { MdPets, MdEventNote, MdNotifications } from 'react-icons/md';

const UserHome = () => {
    const { user, userInfo } = useContext(AuthContext);
    const [petData, setPetData] = useState({ 
        totalPets: 0, 
        upcomingVaccinations: [], 
        upcomingAppointments: [] 
    });
    const [adoptionRequests, setAdoptionRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adoptionLimitStatus, setAdoptionLimitStatus] = useState(null);
    const navigate = useNavigate();

    // Fetch adoption requests
    const fetchAdoptionRequests = async () => {
        try {
            const response = await fetch('https://cse471-production.up.railway.app/owner-adoption-requests', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setAdoptionRequests(data);
            }
        } catch (error) {
            console.error('Error fetching adoption requests:', error);
        }
    };

    // Fetch adoption limit status
    const fetchAdoptionLimitStatus = async () => {
        try {
            const response = await fetch('https://cse471-production.up.railway.app/adoption-limit-status', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setAdoptionLimitStatus(data);
                console.log('Adoption limit status:', data);
            }
        } catch (error) {
            console.error('Error fetching adoption limit status:', error);
        }
    };

    // Handle adoption request approval/rejection
    const handleAdoptionRequest = async (requestId, status) => {
        try {
            const response = await fetch(`https://cse471-production.up.railway.app/review-adoption/${requestId}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });
            
            const data = await response.json();
            alert(data.message);
            
            // Refresh adoption requests
            fetchAdoptionRequests();
        } catch (error) {
            console.error('Error handling adoption request:', error);
            alert('Failed to process request');
        }
    };

    useEffect(() => {
        const fetchPetData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const response = await fetch('https://cse471-production.up.railway.app/pets', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error('Please log in to view your pets');
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Raw pet data:', data);

                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received from server');
                }

                const totalPets = data.length;

                // Process vaccinations
                const allVaccinations = data.flatMap(pet => {
                    if (!Array.isArray(pet.vaccinations)) {
                        console.log(`No vaccinations array for pet ${pet.name}`);
                        return [];
                    }
                    return pet.vaccinations.map(v => ({
                        ...v,
                        petName: pet.name,
                        date: new Date(v.date),
                        nextVaccinationDate: v.nextVaccinationDate ? new Date(v.nextVaccinationDate) : null
                    }));
                });

                const upcomingVaccinations = allVaccinations
                    .filter(v => {
                        const date = v.nextVaccinationDate || v.date;
                        return date && date >= new Date();
                    })
                    .sort((a, b) => {
                        const dateA = a.nextVaccinationDate || a.date;
                        const dateB = b.nextVaccinationDate || b.date;
                        return dateA - dateB;
                    });

                // Process appointments
                const allAppointments = data.flatMap(pet => {
                    if (!Array.isArray(pet.vetAppointments)) {
                        console.log(`No appointments array for pet ${pet.name}`);
                        return [];
                    }
                    return pet.vetAppointments.map(a => ({
                        ...a,
                        petName: pet.name,
                        dateOfAppointment: new Date(a.dateOfAppointment)
                    }));
                });

                const upcomingAppointments = allAppointments
                    .filter(a => a.dateOfAppointment && a.dateOfAppointment >= new Date())
                    .sort((a, b) => a.dateOfAppointment - b.dateOfAppointment);

                setPetData({
                    totalPets,
                    upcomingVaccinations,
                    upcomingAppointments,
                });
            } catch (error) {
                console.error('Error fetching pet data:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPetData();
        fetchAdoptionRequests();
        fetchAdoptionLimitStatus();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full min-h-screen p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="text-lg font-medium text-blue-600">Loading...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center w-full min-h-screen p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <div className="w-full max-w-md p-6 text-center shadow-xl bg-white/80 backdrop-blur-md rounded-xl">
                    <div className="mb-2 text-4xl text-red-500">⚠️</div>
                    <div className="mb-1 text-lg font-medium text-red-600">Oops! Something went wrong</div>
                    <div className="text-gray-600">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen p-4 bg-gradient-to-br from-blue-50 via-cyan-100 via-teal-100 via-blue-100 to-indigo-100 relative overflow-hidden">
    {/* ===== OCEAN PET WAVES BACKGROUND ===== */}
    <div className="absolute inset-0 pointer-events-none">
        {/* Light Blue Bubbles */}
        <div className="absolute top-20 left-10 w-8 h-8 rounded-full bg-blue-200 opacity-30 animate-bounce shadow-lg shadow-blue-100"></div>
        <div className="absolute top-40 left-20 w-5 h-5 rounded-full bg-blue-300 opacity-25 animate-pulse delay-1000"></div>
        <div className="absolute top-60 left-1/3 w-6 h-6 rounded-full bg-blue-200 opacity-20 animate-bounce delay-500"></div>
        
        {/* Cyan Bubbles */}
        <div className="absolute top-32 right-1/4 w-7 h-7 rounded-full bg-cyan-300 opacity-35 animate-bounce delay-1000 shadow-lg shadow-cyan-100"></div>
        <div className="absolute top-64 right-1/3 w-4 h-4 rounded-full bg-cyan-200 opacity-30 animate-pulse delay-500"></div>
        <div className="absolute top-80 right-1/2 w-5 h-5 rounded-full bg-cyan-300 opacity-25 animate-bounce delay-1500"></div>
        
        {/* Teal Bubbles */}
        <div className="absolute top-1/2 left-16 w-6 h-6 rounded-full bg-teal-300 opacity-30 animate-bounce delay-2000 shadow-lg shadow-teal-100"></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-teal-200 opacity-25 animate-pulse delay-1000"></div>
        
        {/* Deep Blue Bubbles */}
        <div className="absolute bottom-40 left-20 w-5 h-5 rounded-full bg-indigo-300 opacity-35 animate-pulse delay-3000 shadow-lg shadow-indigo-100"></div>
        <div className="absolute bottom-60 right-1/4 w-7 h-7 rounded-full bg-indigo-200 opacity-30 animate-bounce delay-500"></div>
        <div className="absolute bottom-80 left-1/3 w-6 h-6 rounded-full bg-indigo-300 opacity-25 animate-pulse delay-2500"></div>
        
        {/* Light Teal Bubbles */}
        <div className="absolute bottom-96 right-1/2 w-4 h-4 rounded-full bg-teal-200 opacity-20 animate-bounce delay-1000"></div>
        <div className="absolute top-1/4 right-16 w-5 h-5 rounded-full bg-teal-300 opacity-30 animate-bounce delay-1500 shadow-lg shadow-teal-100"></div>
    </div>
    {/* ===== END OCEAN PET WAVES ===== */}

    <div className="mx-auto max-w-7xl pt-16 relative z-10">

                {/* Pet Dashboard */}
                <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-3">
                    {/* Pet Count Card */}
                    <div className="relative p-4 overflow-hidden transition-all duration-300 transform shadow-2xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl hover:scale-105 group hover:bg-white/25">
                        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:opacity-100"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="mb-1 text-base font-semibold text-slate-700">Total Owned Pets</h3>
                                    <p className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                                        {petData.totalPets}
                                    </p>
                                    {/* Adoption Limit Indicator */}
                                    {adoptionLimitStatus ? (
                                        <div className="mt-2 space-y-1">
                                            <div className={`text-xs font-medium ${
                                                adoptionLimitStatus.canAdopt ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {adoptionLimitStatus.canAdopt ? '✅ Can Adopt More' : '🚫 Limit Reached'}
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                <span className="text-slate-500">Limit: {adoptionLimitStatus.limit} pets</span>
                                                {adoptionLimitStatus.canAdopt && (
                                                    <span className="ml-2 text-green-600">
                                                        • {adoptionLimitStatus.remainingSlots} slot(s) remaining
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-xs text-slate-600">
                                            <span className={`font-medium ${petData.totalPets >= 3 ? 'text-red-500' : petData.totalPets >= 2 ? 'text-orange-500' : 'text-green-500'}`}>
                                                {petData.totalPets >= 3 ? '🚫 Limit Reached' : petData.totalPets >= 2 ? '⚠️ Near Limit' : '✅ Can Adopt More'}
                                            </span>
                                            <span className="text-slate-500"> • Max: 3 pets</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-3xl animate-bounce">🐾</div>
                            </div>
                        </div>
                    </div>

                    {/* Add Pet Profile Card */}
                    <div className="relative p-4 overflow-hidden transition-all duration-300 transform shadow-2xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl hover:scale-105 group lg:col-span-2 hover:bg-white/25">
                        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 group-hover:opacity-100"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h2 className="mb-2 text-lg font-bold text-slate-700">Add New Pet</h2>
                            <p className="mb-3 text-sm text-slate-600">
                                Because every journey begins with a story — start yours by sharing your pet's.
                            </p>
                            <button
                            onClick={() => navigate('/addpet')}
                            className="px-6 py-2 font-semibold text-white transition-all duration-300 transform rounded-2xl shadow-lg bg-gradient-to-r from-pink-500 to-pink-600 hover:shadow-2xl hover:scale-105 hover:from-pink-600 hover:to-pink-700"
                        >
                            ➕ New Pet
                        </button>
                        </div>
                    </div>
                </div>

                {/* Upcoming Events Section */}
                <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-2">
                    {/* Upcoming Vaccinations Card */}
                    <div className="p-4 shadow-2xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl transition-all duration-300 hover:bg-white/25">
                        <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-slate-700">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100/50 backdrop-blur-sm rounded-2xl border border-blue-200/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            Upcoming Vaccinations
                        </h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {petData.upcomingVaccinations.length > 0 ? (
                                petData.upcomingVaccinations.map((vaccination, index) => (
                                    <div key={index} className="p-3 transition-all duration-300 transform border border-blue-200/30 rounded-2xl bg-gradient-to-r from-blue-50/50 to-blue-100/30 backdrop-blur-sm hover:scale-105 hover:shadow-lg">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="mb-1 text-sm font-semibold text-blue-800">{vaccination.vaccineName}</h4>
                                                <div className="space-y-0.5">
                                                    <p className="flex items-center gap-1 text-xs text-blue-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        Pet: {vaccination.petName}
                                                    </p>
                                                    <p className="flex items-center gap-1 text-xs text-blue-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        Date: {(vaccination.nextVaccinationDate || vaccination.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-blue-600">Next: {(vaccination.nextVaccinationDate || vaccination.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {vaccination.notes && (
                                            <p className="p-2 mt-2 text-xs text-slate-600 rounded-xl bg-white/60 backdrop-blur-sm">{vaccination.notes}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-4 text-center">
                                    <div className="mb-2 text-2xl">💉</div>
                                    <p className="text-sm text-slate-500">No upcoming vaccinations scheduled</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Vet Appointments Card */}
                    <div className="p-4 shadow-2xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl transition-all duration-300 hover:bg-white/25">
                        <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-slate-700">
                            <div className="flex items-center justify-center w-8 h-8 bg-purple-100/50 backdrop-blur-sm rounded-2xl border border-purple-200/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            Upcoming Vet Appointments
                        </h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {petData.upcomingAppointments.length > 0 ? (
                                petData.upcomingAppointments.map((appointment, index) => (
                                    <div key={index} className="p-3 transition-all duration-300 transform border border-purple-200/30 rounded-2xl bg-gradient-to-r from-purple-50/50 to-purple-100/30 backdrop-blur-sm hover:scale-105 hover:shadow-lg">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="mb-1 text-sm font-semibold text-purple-800">Dr. {appointment.doctorName}</h4>
                                                <div className="space-y-0.5">
                                                    <p className="flex items-center gap-1 text-xs text-purple-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                        Pet: {appointment.petName}
                                                    </p>
                                                    <p className="flex items-center gap-1 text-xs text-purple-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                        Date: {appointment.dateOfAppointment.toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {appointment.address && (
                                                <div className="text-right">
                                                    <p className="text-xs font-medium text-purple-600">{appointment.address}</p>
                                                </div>
                                            )}
                                        </div>
                                        {appointment.notes && (
                                            <p className="p-2 mt-2 text-xs text-slate-600 rounded-xl bg-white/60 backdrop-blur-sm">{appointment.notes}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-4 text-center">
                                    <div className="mb-2 text-2xl">🏥</div>
                                    <p className="text-sm text-slate-500">No upcoming appointments scheduled</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Adoption Requests Section */}
                {adoptionRequests.length > 0 && (
                    <div className="p-4 mb-4 shadow-2xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl transition-all duration-300 hover:bg-white/25">
                        <h3 className="flex items-center gap-2 mb-3 text-lg font-bold text-slate-700">
                            <div className="flex items-center justify-center w-8 h-8 bg-orange-100/50 backdrop-blur-sm rounded-2xl border border-orange-200/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            Adoption Requests ({adoptionRequests.length})
                        </h3>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {adoptionRequests.map((request, index) => (
                                <div key={index} className="p-4 transition-all duration-300 transform border border-orange-200/30 rounded-2xl bg-gradient-to-r from-orange-50/50 to-orange-100/30 backdrop-blur-sm hover:scale-105 hover:shadow-lg">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={getPetImageUrl(request.petId?.image)} 
                                                alt={request.petId?.name}
                                                className="object-cover w-12 h-12 rounded-2xl shadow-md"
                                                onError={handleImageError}
                                            />
                                            <div>
                                                <h4 className="text-sm font-semibold text-orange-800">{request.petId?.name}</h4>
                                                <p className="text-xs text-orange-600">{request.petId?.breed}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-orange-600">Requested by:</p>
                                            <p className="text-xs text-orange-800">{request.requestedBy?.name}</p>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <p className="text-xs text-slate-600">Contact: {request.requestedBy?.email}</p>
                                        {request.requestedBy?.phone && (
                                            <p className="text-xs text-slate-600">Phone: {request.requestedBy?.phone}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAdoptionRequest(request._id, 'approved')}
                                            className="flex-1 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 transform bg-gradient-to-r from-green-500 to-green-600 rounded-2xl hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => handleAdoptionRequest(request._id, 'rejected')}
                                            className="flex-1 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 transform bg-gradient-to-r from-red-500 to-red-600 rounded-2xl hover:from-red-600 hover:to-red-700 hover:scale-105 shadow-lg"
                                        >
                                            ✗ Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Button Section */}
                <div className="p-4 transition-all duration-300 transform shadow-2xl bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl hover:scale-105 hover:bg-white/25"> 
                    <div className="flex flex-col items-center text-center">
                        <h2 className="mb-2 text-lg font-bold text-slate-700">Pet Experiences & Reviews</h2>
                        <p className="mb-3 text-sm text-slate-600">
                            Read and share experiences with other pet owners
                        </p>
                        
                        <button
                        onClick={() => navigate('/reviews')}
                        className="px-8 py-3 font-bold text-white transition-all duration-300 transform rounded-2xl shadow-xl bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 hover:from-pink-500 hover:via-purple-600 hover:to-indigo-600 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pink-300/50"
                    >
                        🐾 Read Reviews
                    </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserHome;

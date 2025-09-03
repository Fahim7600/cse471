import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPetImageUrl, handleImageError } from '../../utils/imageUtils';
import { IoMale, IoFemale } from 'react-icons/io5';
import { AuthContext } from '../../provider/Authprovider';

const Adoption = () => {
    const [pets, setPets] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [ageSort, setAgeSort] = useState('none');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // Function to calculate age from date of birth 
    const calculateAge = (dob) => {
        if (!dob) return 'Age not available';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // fetch pets with search and age sorting
    const fetchPets = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                search: searchTerm,
                ageFilter: ageSort
            });
            
            console.log('Fetching with params:', { searchTerm, ageSort });
            const response = await fetch(`http://localhost:3000/available-adoptions?${queryParams}`, {
                credentials: 'include'
            });
            const data = await response.json();
            console.log('Received data:', data);
            setPets(data);
        } catch (err) {
            console.error('Failed to load pets for adoption:', err);
        } finally {
            setLoading(false);
        }
    };

    // Added by initial fetch and debounced search
    useEffect(() => {
        console.log('Initial fetch');
        fetchPets();
    }, []);

    useEffect(() => {
        console.log('Search/Sort changed:', { searchTerm, ageSort });
        const timer = setTimeout(() => {
            fetchPets();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, ageSort]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="px-4 py-12 mx-auto adoption-list max-w-7xl sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                        Pet Adoption List
                    </h2>
                    <p className="text-lg text-blue-600/80 max-w-2xl mx-auto">
                        Discover loving pets waiting for their forever homes. Each adoption creates a beautiful bond that lasts a lifetime.
                    </p>
                </div>
                
                {/* Search and Filter Section */}
                <div className="mb-10">
                    <div className="flex flex-col gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 sm:flex-row">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by name or breed..."
                                className="w-full p-4 pl-12 text-gray-700 placeholder-blue-400/60 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-300/50 focus:border-blue-400 transition-all duration-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg 
                                className="absolute left-4 top-4 w-5 h-5 text-blue-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <select
                            className="p-4 text-gray-700 bg-blue-50/50 border border-blue-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-300/50 focus:border-blue-400 transition-all duration-200 min-w-[180px]"
                            value={ageSort}
                            onChange={(e) => setAgeSort(e.target.value)}
                        >
                            <option value="none">Sort by Age</option>
                            <option value="youngest">Youngest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-xl text-blue-600/80 font-medium">Finding your perfect companion...</p>
                    </div>
                ) : pets.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <p className="text-xl text-blue-600/80 font-medium mb-2">No pets found</p>
                        <p className="text-blue-500/60">Try adjusting your search criteria or check back later for new arrivals.</p>
                    </div>
                ) : (
                    /* Pet Cards Grid */
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {pets.map((pet, index) => (
                            <div key={index} className="group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200">
                                {/* Pet Image */}
                                <div className="relative overflow-hidden">
                                    <img
                                        src={getPetImageUrl(pet?.image)}
                                        alt={pet?.name}
                                        className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                                        onError={handleImageError}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                
                                {/* Pet Information */}
                                <div className="p-5">
                                    <div className="mb-3">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                                {pet?.name}
                                                {pet?.gender === 'Male' ? (
                                                    <IoMale className="w-5 h-5 text-blue-500 ml-2 align-middle" style={{verticalAlign: 'middle'}} />
                                                ) : pet?.gender === 'Female' ? (
                                                    <IoFemale className="w-5 h-5 text-pink-500 ml-2 align-middle" style={{verticalAlign: 'middle'}} />
                                                ) : (
                                                    <span className="text-gray-500 text-sm ml-2 align-middle" style={{verticalAlign: 'middle'}}>?</span>
                                                )}
                                            </h3>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-blue-600 font-medium text-sm text-center">{pet?.breed}</p>
                                            <p className="text-blue-600 font-medium text-sm text-center">Age: {calculateAge(pet?.dob)} years</p>
                                            <p className="text-blue-600 font-medium text-sm text-center">Gender: {pet?.gender}</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pet?.description}</p>
                                    
                                    {/* Owner Information */}
                                    <div className="p-3 mb-4 rounded-xl bg-blue-50/80 border border-blue-100">
                                        <h4 className="font-semibold text-blue-800 text-sm mb-2">Owner Contact</h4>
                                        <p className="text-xs text-blue-700 mb-1">📧 {pet?.owner?.email}</p>
                                        <p className="text-xs text-blue-700">👤 {pet?.owner?.name}</p>
                                        {pet?.owner?.phone && (
                                            <p className="text-xs text-blue-700">📞 {pet?.owner?.phone}</p>
                                        )}
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button 
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-3 focus:ring-blue-300/50 text-sm"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`http://localhost:3000/request-pet-adoption/${pet._id}`, {
                                                        method: 'POST',
                                                        credentials: 'include',
                                                    });
                                                    const data = await res.json();
                                                    
                                                    // Handle adoption limit error specifically
                                                    if (res.status === 403 && data.limitReached) {
                                                        console.log(`Adoption limit reached: User has ${data.currentPets}/${data.limit} pets`);
                                                        console.log('Adoption limit error details:', data);
                                                        
                                                        // Show user-friendly error message
                                                        alert(`🚫 Adoption Limit Reached!\n\nYou currently have ${data.currentPets} pets and have reached your limit of ${data.limit} pets.\n\nYou cannot adopt more pets, but you can still add new pets to your profile if you want to expand your pet family.`);
                                                    } else if (res.ok) {
                                                        alert(data.message);
                                                    } else {
                                                        alert(data.message || 'Adoption request failed');
                                                    }
                                                } catch (err) {
                                                    console.error('Adoption request failed:', err);
                                                    alert('Request failed: ' + (err.message || 'Unknown error'));
                                                }
                                            }}
                                        >
                                            🏠 Adopt
                                        </button>
                                        {(() => {
                                            // Debug logging
                                            console.log('User:', user);
                                            console.log('Pet owner:', pet?.owner);
                                            console.log('User ID:', user?.id);
                                            console.log('Pet owner ID:', pet?.owner?._id);
                                            console.log('Are they equal?', pet?.owner?._id === user?.id);
                                            
                                            if (user && pet?.owner?._id !== user.id) {
                                                return (
                                                    <button 
                                                        className="flex-1 bg-white border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 font-medium py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-3 focus:ring-blue-300/50 text-sm"
                                                        onClick={async () => {
                                                            try {
                                                                // Check if chat exists for this pet
                                                                const chatResponse = await fetch(`http://localhost:3000/api/chat/check/${pet._id}`, {
                                                                    credentials: 'include'
                                                                });
                                                                
                                                                if (chatResponse.ok) {
                                                                    const chatData = await chatResponse.json();
                                                                    
                                                                    if (chatData.chatExists) {
                                                                        // Navigate to existing chat
                                                                        navigate(`/chat/${chatData.chatId}`);
                                                                    } else {
                                                                        // Navigate to new chat interface with pet info
                                                                        navigate(`/chat/new/${pet._id}`);
                                                                    }
                                                                } else {
                                                                    console.error('Failed to check chat');
                                                                    alert('Failed to start chat. Please try again.');
                                                                }
                                                            } catch (error) {
                                                                console.error('Error checking chat:', error);
                                                                alert('Failed to start chat. Please try again.');
                                                            }
                                                        }}
                                                    >
                                                        💬 Chat
                                                    </button>
                                                );
                                            } else {
                                                return (
                                                    <button 
                                                        className="flex-1 bg-gray-300 text-gray-500 font-medium py-2.5 px-4 rounded-xl cursor-not-allowed text-sm"
                                                        disabled
                                                        title={user && pet?.owner?._id === user.id ? "You cannot chat with yourself" : "Please log in to chat"}
                                                    >
                                                        💬 Chat 
                                                    </button>
                                                );
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Adoption;


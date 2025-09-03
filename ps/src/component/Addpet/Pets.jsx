import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PetCard from './PetCard';
import bgImage from '../../assets/bg.jpg';

const Pets = () => {
    const [pets, setPets] = useState([]);
    const [sortOption, setSortOption] = useState('');

    useEffect(() => {
        fetch('http://localhost:3000/pets', {
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    console.log('Fetched pets data:', data); // Debugging log
                    setPets(data);
                } else {
                    console.warn('Not an array:', data);
                    setPets([]);
                }
            })
            .catch(err => {
                console.error('Error fetching pets:', err);
                setPets([]);
            });
    }, []);

    const calculateAge = useCallback((dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }, []);

    const sortedPets = useMemo(() => {
        if (!sortOption) return pets;
        
        const [key, order] = sortOption.split('-');
        return [...pets].sort((a, b) => {
            if (key === 'name') {
                return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            } else if (key === 'age') {
                return order === 'asc' ? calculateAge(a.dob) - calculateAge(b.dob) : calculateAge(b.dob) - calculateAge(a.dob);
            }
            return 0;
        });
    }, [pets, sortOption, calculateAge]);

    const handleSortChange = useCallback((e) => {
        setSortOption(e.target.value);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                        Your Pets ({sortedPets.length})
                    </h2>
                    <p className="text-lg text-blue-600/80 max-w-2xl mx-auto">
                        Manage and organize your beloved pets. Keep track of their information and profiles.
                    </p>
                </div>

                {/* Sort Section */}
                <div className="mb-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
                        <div className="flex items-center justify-end space-x-3">
                            <label htmlFor="sort" className="text-sm font-medium text-blue-700">Sort by:</label>
                            <select
                                id="sort"
                                value={sortOption}
                                onChange={handleSortChange}
                                className="px-4 py-2 text-sm text-gray-700 bg-white border border-blue-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300/40 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md min-w-[160px]"
                            >
                                <option value="">Sort-By</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="age-asc">Age (Asc)</option>
                                <option value="age-desc">Age (Desc)</option>
                            </select>
                        </div>
                    </div>
                </div>

            {/* Pet Cards Grid */}
            {sortedPets.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sortedPets.map((pet) => (
                        <div key={pet._id} className="h-full flex">
                            <PetCard pet={pet} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <img 
                            src="https://img.icons8.com/fluency/96/000000/cat.png"
                            alt="Pet paw print"
                            className="w-12 h-12 opacity-60"
                        />
                    </div>
                    <p className="text-xl text-blue-600/80 font-medium mb-2">
                        No pets to display
                    </p>
                    <p className="text-blue-500/60 mb-6">
                        Add your first pet to get started!
                    </p>
                    <button
                        onClick={() => window.location.href = '/addpet'}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg font-semibold flex items-center space-x-2 mx-auto"
                    >
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                        >
                            <path d="M12 5v14"/>
                            <path d="M5 12h14"/>
                        </svg>
                        <span>Add Your First Pet</span>
                    </button>
                </div>
            )}
            </div>
        </div>
    );
};

export default Pets;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Vaccination = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState({
        name: '',
        vaccinations: []
    });
    const [newVaccination, setNewVaccination] = useState({
        vaccineName: '',
        date: '',
        notes: ''
    });
    const [userPets, setUserPets] = useState([]);
    const [selectedPetId, setSelectedPetId] = useState('');

    useEffect(() => {
        // Fetch user's pets
        fetch('http://localhost:3000/user-pets', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setUserPets(data);
                if (id) {
                    // If coming from PetDetails, load that specific pet
                    const foundPet = data.find(p => p._id === id);
                    if (foundPet) {
                        // Ensure vaccinations array exists
                        setPet({
                            ...foundPet,
                            vaccinations: foundPet.vaccinations || []
                        });
                        setSelectedPetId(id);
                    }
                } else if (data.length > 0) {
                    // Default to first pet if no specific pet ID
                    const firstPet = data[0];
                    setPet({
                        ...firstPet,
                        vaccinations: firstPet.vaccinations || []
                    });
                    setSelectedPetId(firstPet._id);
                }
            })
            .catch(err => console.error('Error fetching pets:', err));
    }, [id]);

    const handlePetChange = (petId) => {
        const selectedPet = userPets.find(p => p._id === petId);
        if (selectedPet) {
            // Ensure vaccinations array exists
            setPet({
                ...selectedPet,
                vaccinations: selectedPet.vaccinations || []
            });
            setSelectedPetId(petId);
        }
    };

    const handleVaccinationChange = (e) => {
        const { name, value } = e.target;
        setNewVaccination({ ...newVaccination, [name]: value });
    };

    const addVaccination = () => {
        if (!selectedPetId) {
            toast.error('Please select a pet first');
            return;
        }

        if (!newVaccination.vaccineName || !newVaccination.date) {
            toast.error('Please fill in vaccine name and date');
            return;
        }

        fetch(`http://localhost:3000/add-vaccination/${selectedPetId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newVaccination),
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.pet && data.pet.vaccinations) {
                    // Get the newly added vaccination (last item in the array)
                    const newVaccinationItem = data.pet.vaccinations[data.pet.vaccinations.length - 1];
                    // Ensure vaccinations array exists and add the new vaccination
                    const updatedVaccinations = [...(pet.vaccinations || []), newVaccinationItem];
                    setPet({ ...pet, vaccinations: updatedVaccinations });
                    setNewVaccination({ vaccineName: '', date: '', notes: '' });
                    toast.success('Vaccination added successfully');
                } else {
                    toast.error('Failed to add vaccination');
                }
            })
            .catch(err => {
                console.error('Error adding vaccination:', err);
                toast.error('Error adding vaccination');
            });
    };

    const cancelVaccination = (vaccinationId) => {
        if (!vaccinationId) {
            toast.error('Invalid vaccination ID');
            return;
        }

        if (window.confirm('Are you sure you want to remove this vaccination record?')) {
            fetch(`http://localhost:3000/delete-vaccination/${selectedPetId}/${vaccinationId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
                .then((res) => {
                    if (!res.ok) {
                        return res.json().then(errorData => {
                            throw new Error(errorData.message || 'Failed to remove vaccination');
                        });
                    }
                    return res.json();
                })
                .then(() => {
                    toast.success('Vaccination record removed successfully');
                    setPet({
                        ...pet,
                        vaccinations: pet.vaccinations.filter((v) => v._id !== vaccinationId),
                    });
                })
                .catch((err) => {
                    console.error('Error removing vaccination:', err);
                    toast.error(err.message || 'Error removing vaccination');
                });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
            <ToastContainer />
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 p-8">
                    <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text mb-8 text-center">
                        🩺 Pet Vaccination Management
                    </h1>

                    {/* Pet Selection - Only show if not coming from specific pet */}
                    {!id && (
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-blue-700 mb-3">Select Pet:</label>
                            <select
                                value={selectedPetId}
                                onChange={(e) => handlePetChange(e.target.value)}
                                className="w-full p-4 border border-blue-200 rounded-xl bg-blue-50/50 focus:outline-none focus:ring-3 focus:ring-blue-300/50 focus:border-blue-400 transition-all duration-200"
                            >
                                <option value="">Choose a pet...</option>
                                {userPets.map(pet => (
                                    <option key={pet._id} value={pet._id}>
                                        {pet.name} ({pet.breed})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Show current pet info when coming from specific pet */}
                    {id && pet.name && (
                        <div className="mb-8 p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border border-blue-200">
                            <h2 className="text-xl font-bold text-blue-700">
                                Managing vaccinations for: <span className="text-blue-900">{pet.name}</span>
                            </h2>
                            <p className="text-blue-600 mt-1">Breed: {pet.breed}</p>
                        </div>
                    )}

                    {selectedPetId && (
                        <>
                            {/* Current Vaccinations */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-blue-700 mb-4">Current Vaccinations for {pet.name}</h2>
                                {pet.vaccinations && pet.vaccinations.length > 0 ? (
                                    <div className="grid gap-4">
                                        {pet.vaccinations.filter(vaccination => vaccination && vaccination.vaccineName).map((vaccination, index) => (
                                            <div key={vaccination._id || index} className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-blue-800 text-lg">{vaccination.vaccineName || 'Unknown Vaccine'}</h3>
                                                        <p className="text-blue-600">Date: {vaccination.date ? new Date(vaccination.date).toLocaleDateString() : 'No date'}</p>
                                                        {vaccination.notes && (
                                                            <p className="mt-2 text-gray-600 italic">📝 {vaccination.notes}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex flex-col items-end space-y-2">
                                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                            Completed
                                                        </span>
                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => cancelVaccination(vaccination._id)}
                                                            className="px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1 whitespace-nowrap"
                                                        >
                                                            <span>🗑️</span>
                                                            <span>Remove</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-blue-600/70">
                                        <p className="text-lg">No vaccinations recorded for {pet.name}</p>
                                        <p className="text-sm">Add the first vaccination below</p>
                                    </div>
                                )}
                            </div>

                            {/* Add New Vaccination */}
                            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200">
                                <h2 className="text-2xl font-bold text-blue-700 mb-6">Add New Vaccination</h2>
                                <div className="grid gap-4">
                                    <input
                                        type="text"
                                        name="vaccineName"
                                        value={newVaccination.vaccineName}
                                        onChange={handleVaccinationChange}
                                        placeholder="Vaccine Name (e.g., Rabies, DHPP)"
                                        className="w-full p-4 border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-blue-300/50 focus:border-blue-400 transition-all duration-200"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-blue-600 mb-2">Vaccination Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={newVaccination.date}
                                            onChange={handleVaccinationChange}
                                            className="w-full p-4 border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-blue-300/50 focus:border-blue-400 transition-all duration-200"
                                        />
                                    </div>
                                    <textarea
                                        name="notes"
                                        value={newVaccination.notes}
                                        onChange={handleVaccinationChange}
                                        placeholder="Notes (optional - any side effects, vet recommendations, etc.)"
                                        rows="3"
                                        className="w-full p-4 border border-blue-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-blue-300/50 focus:border-blue-400 transition-all duration-200"
                                    />
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={addVaccination}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                                    >
                                        💉 Add Vaccination
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Vaccination;

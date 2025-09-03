import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPetImageUrl, handleImageError } from '../../utils/imageUtils';
import { IoMale, IoFemale } from 'react-icons/io5';
import LocationPicker from '../Profile/LocationPicker';
import "../../PetDetails.css"; // Importing the CSS file


const PetDetails = () => {
    const { id } = useParams();
    const [pet, setPet] = useState(null);
    const [isLost, setIsLost] = useState(false); // new change 
    const [walkedHours, setWalkedHours] = useState(0);
    const [walkedDistance, setWalkedDistance] = useState(0);
    const [showWalkingDataPopup, setShowWalkingDataPopup] = useState(false);
    const [showMedicalDataPopup, setShowMedicalDataPopup] = useState(false);
    const [showHealthCard, setShowHealthCard] = useState(false);
    const [showFullLogPopup, setShowFullLogPopup] = useState(false);
    const [showLostLocationPicker, setShowLostLocationPicker] = useState(false);
    const [lostLocation, setLostLocation] = useState({
        address: '',
        latitude: null,
        longitude: null
    });
    const [medicalData, setMedicalData] = useState({
        weight: '',
        diet: '',
        medicalNotes: ''
    });
    const [isInAdoptionList, setIsInAdoptionList] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
         {/* lost stausthandling  */}
        const fetchPetAndLostStatus = async () => {
            try {
                // Fetch pet details
                const petRes = await fetch(`https://cse471-production.up.railway.app/pets/${id}`, {
                    credentials: 'include'
                });
                const petData = await petRes.json();
                setPet(petData);

                // Check if pet is lost
                const lostRes = await fetch(`https://cse471-production.up.railway.app/lost-pets`, {
                    credentials: 'include'
                });

                {/* lost stausthandling  */}

                const lostPets = await lostRes.json();
                const isPetLost = lostPets.some(report => 
                    report.petId._id === id && report.status === 'lost'
                );
                setIsLost(isPetLost);

                // Check if pet is in adoption list
                setIsInAdoptionList(petData.adoptionStatus === 'approved');
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };

        fetchPetAndLostStatus();
        {/* lost stausthandling  change by  -5-10-25 */}

    }, [id]);


    useEffect(() => {
        if (pet) {
            setWalkedHours(0); // Reset walkedHours to 0 when the pet data changes
            setWalkedDistance(0); // Reset walkedDistance to 0 when the pet data changes
        }
    }, [pet]);


    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (months < 0) {
            years--;
            months += 12;
        }
        return years > 0 ? `${years} years ${months} months` : `${months} months`;
    };
    
    const handleLogWalkingData = async () => {
        try {
            const response = await fetch(`https://cse471-production.up.railway.app/update-walking-data/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ walkedHours, walkedDistance }),
            });


            if (response.ok) {
                const updatedPet = await response.json();
                setPet(updatedPet.pet);
                setShowWalkingDataPopup(false);
            } else {
                alert('Failed to log walking data.');
            }
        } catch (error) {
            console.error('Error logging walking data:', error);
            alert('An error occurred while logging walking data.');
        }
    };


    const handleResetWalkingData = async () => {
        try {
            const response = await fetch(`https://cse471-production.up.railway.app/reset-walking-data/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });


            if (response.ok) {
                const updatedPet = await response.json();
                alert('Walking data reset successfully!');
                setPet(updatedPet.pet); // Update the pet state with the reset data
                setShowWalkingDataPopup(false); // Close the popup
            } else {
                alert('Failed to reset walking data.');
            }
        } catch (error) {
            console.error('Error resetting walking data:', error);
            alert('An error occurred while resetting walking data.');
        }
    };


    const handleLogMedicalData = async () => {
        try {
            const response = await fetch(`https://cse471-production.up.railway.app/add-health-log/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...medicalData,
                    date: new Date().toISOString()
                }),
            });

            if (response.ok) {
                const updatedPet = await response.json();
                setPet(updatedPet.pet);
                setShowMedicalDataPopup(false);
                setMedicalData({ weight: '', diet: '', medicalNotes: '' });
            } else {
                alert('Failed to log medical data.');
            }
        } catch (error) {
            console.error('Error logging medical data:', error);
            alert('An error occurred while logging medical data.');
        }
    };


    const getLatestMedicalRecord = () => {
        if (!pet?.healthLogs || pet.healthLogs.length === 0) return null;
        // Sort health logs by date in descending order and get the first one
        return [...pet.healthLogs].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    };

    const handleLostLocationSelect = async (locationData) => {
        setLostLocation({
            address: locationData.address,
            latitude: locationData.lat,
            longitude: locationData.lon
        });
        setShowLostLocationPicker(false);

        // Now submit the lost pet report with location
        try {
            const res = await fetch(`https://cse471-production.up.railway.app/report-lost/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    lostLocation: {
                        address: locationData.address,
                        latitude: locationData.lat,
                        longitude: locationData.lon
                    }
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Pet reported as lost from: ${locationData.address}`);
                setIsLost(true); // Update lost status
                navigate('/lostorfound'); // Redirect to lost pets page
            } else {
                alert(data.message || 'Failed to report pet as lost');
            }
        } catch (err) {
            console.error('Error reporting lost pet:', err);
            alert('Failed to report pet as lost');
        }
    };


    const latestRecord = getLatestMedicalRecord();


    if (!pet) return <p className="text-center text-red-500">Pet not found</p>;


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container px-4 py-6 mx-auto">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Column - Takes 8 columns on large screens */}
                    <div className="space-y-6 lg:col-span-8">
                        <div className="overflow-hidden bg-white shadow-lg rounded-2xl">
                            <div className="p-6">
                                <div className="flex flex-col gap-6 md:flex-row">
                                    <div className="w-full md:w-1/3">
                                        <div className="relative group">
                                            <img 
                                                src={getPetImageUrl(pet.image)} 
                                                alt={pet.name} 
                                                className="object-cover w-full transition-transform duration-300 transform shadow-md h-80 rounded-xl group-hover:scale-105"
                                                onError={handleImageError}
                                            />
                                            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/50 to-transparent group-hover:opacity-100 rounded-xl"></div>
                                        </div>
                                    </div>
                                    <div className="w-full space-y-4 md:w-2/3">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <h1 className="text-4xl font-bold text-gray-800">
                                                {pet.name}
                                            </h1>
                                            {/* Gender Icon */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                                                pet.gender === 'Male' 
                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                                    : pet.gender === 'Female'
                                                    ? 'bg-gradient-to-br from-pink-500 to-pink-600'
                                                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                            }`}>
                                                {pet.gender === 'Male' ? (
                                                    <IoMale className="w-5 h-5 text-white" />
                                                ) : pet.gender === 'Female' ? (
                                                    <IoFemale className="w-5 h-5 text-white" />
                                                ) : (
                                                    <span className="text-white text-sm font-bold">?</span>
                                                )}
                                            </div>
                                            <span className="text-lg font-normal text-gray-500">({pet.breed})</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg bg-blue-50">
                                                <p className="text-sm font-medium text-blue-600">Age</p>
                                                <p className="text-xl font-semibold text-gray-800">{calculateAge(pet.dob)}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-green-50">
                                                <p className="text-sm font-medium text-green-600">Birth Date</p>
                                                <p className="text-xl font-semibold text-gray-800">{new Date(pet.dob).toLocaleDateString()}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-purple-50">
                                                <p className="text-sm font-medium text-purple-600">Breed</p>
                                                <p className="text-xl font-semibold text-gray-800">{pet.breed}</p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-pink-50">
                                                <p className="text-sm font-medium text-pink-600">Gender</p>
                                                <p className="text-xl font-semibold text-gray-800">{pet.gender}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-lg bg-gray-50">
                                            <h3 className="mb-2 text-sm font-medium text-gray-600">Description</h3>
                                            <p className="text-lg text-gray-700">{pet.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="p-6 bg-white shadow-lg rounded-2xl">
                                <h2 className="flex items-center mb-4 text-2xl font-bold text-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Vaccination Details
                                </h2>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {pet.vaccinations?.length > 0 ? (
                                        pet.vaccinations.map((vaccine, index) => (
                                            <div key={index} className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-blue-800">{vaccine.vaccineName}</h3>
                                                        <p className="text-sm text-blue-600">Date: {new Date(vaccine.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {vaccine.notes && (
                                                    <p className="mt-2 text-sm text-gray-600">{vaccine.notes}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-4 text-center text-gray-500">No vaccination details available</p>
                                    )}
                                    <button
                                        onClick={() => navigate(`/vaccination/${id}`)}
                                        className="w-full mt-4 py-2.5 px-4 text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                                    >
                                        Get Vaccination
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-white shadow-lg rounded-2xl">
                                <h2 className="flex items-center mb-4 text-2xl font-bold text-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Vet Appointments
                                </h2>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {pet.vetAppointments?.length > 0 ? (
                                        pet.vetAppointments.map((appointment, index) => (
                                            <div key={index} className="p-4 border border-purple-100 rounded-lg bg-purple-50">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-purple-800">{appointment.doctorName}</h3>
                                                        <p className="text-sm text-purple-600">{appointment.address}</p>
                                                    </div>
                                                    <p className="text-sm text-purple-600">{new Date(appointment.dateOfAppointment).toLocaleDateString()}</p>
                                                </div>
                                                {appointment.notes && (
                                                    <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-4 text-center text-gray-500">No appointments available</p>
                                    )}
                                    <button
                                        onClick={() => navigate(`/vet-appointment/${id}`)}
                                        className="w-full mt-4 py-2.5 px-4 text-center text-white bg-purple-500 rounded-lg hover:bg-purple-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                                    >
                                        Book an Appointment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Takes 4 columns on large screens */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="p-6 bg-white shadow-lg rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="flex items-center text-2xl font-bold text-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Walking Statistics
                                </h2>
                                <button
                                    onClick={() => setShowWalkingDataPopup(true)}
                                    className="text-blue-500 transition-colors duration-300 hover:text-blue-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-blue-50">
                                    <div className="flex items-center mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-blue-600">Total Hours</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700">{pet.totalWalkedHours || 0}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-green-50">
                                    <div className="flex items-center mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <span className="text-sm font-medium text-green-600">Total Distance</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-700">{pet.totalWalkedDistance || 0} km</p>
                                </div>
                                <div className="p-4 rounded-lg bg-purple-50">
                                    <div className="flex items-center mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className="text-sm font-medium text-purple-600">Avg. Hours</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-700">{(pet.avgWalkedHours || 0).toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-orange-50">
                                    <div className="flex items-center mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <span className="text-sm font-medium text-orange-600">Avg. Distance</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-700">{(pet.avgWalkedDistance || 0).toFixed(2)} km</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white shadow-lg rounded-2xl">
                            <h2 className="flex items-center mb-4 text-2xl font-bold text-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Latest Health Record
                            </h2>
                            
                            {latestRecord ? (
                                <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="record-item">
                                            <span className="text-sm font-medium text-green-600">Date</span>
                                            <span className="block text-lg font-bold text-gray-800">
                                                {new Date(latestRecord.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="record-item">
                                            <span className="text-sm font-medium text-green-600">Weight</span>
                                            <span className="block text-lg font-bold text-gray-800">{latestRecord.weight} kg</span>
                                        </div>
                                        <div className="record-item">
                                            <span className="text-sm font-medium text-green-600">Diet</span>
                                            <span className="block text-lg font-bold text-gray-800">{latestRecord.diet}</span>
                                        </div>
                                        <div className="record-item">
                                            <span className="text-sm font-medium text-green-600">Time</span>
                                            <span className="block text-lg font-bold text-gray-800">
                                                {new Date(latestRecord.date).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="col-span-2 record-item">
                                            <span className="text-sm font-medium text-green-600">Medical Notes</span>
                                            <span className="block text-lg font-bold text-gray-800">{latestRecord.medicalNotes}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 text-center rounded-lg bg-gray-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500">No health records available</p>
                                </div>
                            )}

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowFullLogPopup(true)}
                                    className="flex-1 py-2.5 px-4 text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    View Full Log
                                </button>
                                <button
                                    onClick={() => setShowMedicalDataPopup(true)}
                                    className="flex-1 py-2.5 px-4 text-center text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Health Log
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-3 bg-white shadow-lg rounded-2xl">
                        <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch(`https://cse471-production.up.railway.app/request-adoption/${id}`, {
                                            method: 'POST',
                                            credentials: 'include',
                                        });
                                        const data = await res.json();
                                        alert(data.message);
                                        
                                        // Update the local state based on the response
                                        setIsInAdoptionList(data.inAdoptionList);
                                        
                                        // Refresh pet data to update the adoption status
                                        const updatedPetRes = await fetch(`https://cse471-production.up.railway.app/pets/${id}`, {
                                            credentials: 'include'
                                        });
                                        const updatedPetData = await updatedPetRes.json();
                                        setPet(updatedPetData);
                                    } catch (err) {
                                        alert('Request failed');
                                    }
                                }}
                                className={`w-full py-2.5 px-4 text-center text-white rounded-lg transition duration-300 font-semibold text-sm flex items-center justify-center ${
                                    isInAdoptionList 
                                        ? 'bg-red-500 hover:bg-red-600' 
                                        : 'bg-purple-500 hover:bg-purple-600'
                                }`}
                            >
                                {isInAdoptionList ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel Adoption
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Submit For Adoption
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => navigate(`/edit-pet/${id}`)}
                                className="w-full py-2.5 px-4 text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </button>

                            

                            {/*  */}
                            <button
                                onClick={() => setShowLostLocationPicker(true)}
                                className="w-full px-4 py-2 text-sm font-semibold text-center text-white transition duration-300 bg-red-500 rounded-lg hover:bg-red-700 hover:scale-105 flex items-center justify-center"
                                style={{ display: isLost ? 'none' : 'block' }} //lost stausthandling */}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Report as Lost
                            </button>
                            {/* end */}
                            <button
                                onClick={async () => {
                                    if (window.confirm('Are you sure you want to remove this pet?')) {
                                        try {
                                            const response = await fetch(`https://cse471-production.up.railway.app/delete-pet/${id}`, {
                                                method: 'DELETE',
                                                credentials: 'include',
                                            });

                                            if (response.ok) {
                                                alert('Pet removed successfully.');
                                                navigate('/pets');
                                            } else {
                                                alert('Failed to remove pet.');
                                            }
                                        } catch (error) {
                                            console.error('Error removing pet:', error);
                                            alert('An error occurred while removing the pet.');
                                        }
                                    }
                                }}
                                className="w-full py-2.5 px-4 text-center text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove Pet
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Walking Data Popup */}
            {showWalkingDataPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="flex items-center text-2xl font-bold text-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Edit Walking Data
                            </h2>
                            <button
                                onClick={() => setShowWalkingDataPopup(false)}
                                className="text-gray-400 transition-colors duration-300 hover:text-gray-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 rounded-lg bg-blue-50">
                                <div className="flex items-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <label htmlFor="walked-hours" className="block text-sm font-medium text-blue-600">
                                        Hours Walked
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    id="walked-hours"
                                    placeholder="Enter Hours Walked"
                                    className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                    value={walkedHours}
                                    onChange={(e) => setWalkedHours(Number(e.target.value))}
                                />
                            </div>

                            <div className="p-4 rounded-lg bg-green-50">
                                <div className="flex items-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <label htmlFor="walked-distance" className="block text-sm font-medium text-green-600">
                                        Distance (km)
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    id="walked-distance"
                                    placeholder="Enter Distance (km)"
                                    className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
                                    value={walkedDistance}
                                    onChange={(e) => setWalkedDistance(Number(e.target.value))}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleLogWalkingData}
                                    className="flex-1 py-2.5 px-4 text-center text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save
                                </button>
                                <button
                                    onClick={() => setShowWalkingDataPopup(false)}
                                    className="flex-1 py-2.5 px-4 text-center text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetWalkingData}
                                    className="flex-1 py-2.5 px-4 text-center text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showFullLogPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-4xl p-6 bg-white shadow-xl rounded-2xl">
                        <h2 className="mb-6 text-2xl font-bold text-gray-800">Health Log History</h2>
                        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                            {pet.healthLogs?.length > 0 ? (
                                pet.healthLogs.map((log, index) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="record-item">
                                                <span className="text-sm font-medium text-gray-600">Date:</span>
                                                <span className="block text-lg font-bold text-gray-800">
                                                    {new Date(log.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="record-item">
                                                <span className="text-sm font-medium text-gray-600">Weight:</span>
                                                <span className="block text-lg font-bold text-gray-800">{log.weight} kg</span>
                                            </div>
                                            <div className="record-item">
                                                <span className="text-sm font-medium text-gray-600">Diet:</span>
                                                <span className="block text-lg font-bold text-gray-800">{log.diet}</span>
                                            </div>
                                            <div className="record-item">
                                                <span className="text-sm font-medium text-gray-600">Time:</span>
                                                <span className="block text-lg font-bold text-gray-800">
                                                    {new Date(log.date).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <div className="col-span-2 record-item">
                                                <span className="text-sm font-medium text-gray-600">Medical Notes:</span>
                                                <span className="block text-lg font-bold text-gray-800">{log.medicalNotes}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500">No health logs available</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowFullLogPopup(false)}
                            className="w-full mt-6 py-2.5 px-4 text-center text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition duration-300 font-semibold text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showMedicalDataPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="flex items-center text-2xl font-bold text-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Add Health Log
                            </h2>
                            <button
                                onClick={() => setShowMedicalDataPopup(false)}
                                className="text-gray-400 transition-colors duration-300 hover:text-gray-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 rounded-lg bg-green-50">
                                <div className="flex items-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                    </svg>
                                    <label htmlFor="weight" className="block text-sm font-medium text-green-600">
                                        Weight (kg)
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    id="weight"
                                    placeholder="Enter Weight"
                                    className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
                                    value={medicalData.weight}
                                    onChange={(e) => setMedicalData({ ...medicalData, weight: e.target.value })}
                                />
                            </div>

                            <div className="p-4 rounded-lg bg-blue-50">
                                <div className="flex items-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <label htmlFor="diet" className="block text-sm font-medium text-blue-600">
                                        Diet
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    id="diet"
                                    placeholder="Enter Diet"
                                    className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                                    value={medicalData.diet}
                                    onChange={(e) => setMedicalData({ ...medicalData, diet: e.target.value })}
                                />
                            </div>

                            <div className="p-4 rounded-lg bg-purple-50">
                                <div className="flex items-center mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <label htmlFor="medicalNotes" className="block text-sm font-medium text-purple-600">
                                        Medical Notes
                                    </label>
                                </div>
                                <textarea
                                    id="medicalNotes"
                                    placeholder="Enter Medical Notes"
                                    rows="4"
                                    className="w-full px-4 py-2.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-700 resize-none"
                                    value={medicalData.medicalNotes}
                                    onChange={(e) => setMedicalData({ ...medicalData, medicalNotes: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleLogMedicalData}
                                    className="flex-1 py-2.5 px-4 text-center text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save
                                </button>
                                <button
                                    onClick={() => setShowMedicalDataPopup(false)}
                                    className="flex-1 py-2.5 px-4 text-center text-white bg-red-500 rounded-lg hover:bg-red-600 transition duration-300 font-semibold text-sm flex items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Lost Location Picker Popup */}
            {showLostLocationPicker && (
                <LocationPicker
                    onLocationSelect={handleLostLocationSelect}
                    onClose={() => setShowLostLocationPicker(false)}
                    initialLocation={lostLocation}
                    title="Select Lost Location"
                    subtitle="Please select the location where your pet was lost"
                />
            )}
        </div>
    );
};


export default PetDetails;




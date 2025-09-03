import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VetAppointment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState({
        name: '',
        vetAppointments: []
    });
    const [newAppointment, setNewAppointment] = useState({
        doctorName: '',
        address: '',
        dateOfAppointment: '',
        notes: ''
    });
    const [userPets, setUserPets] = useState([]);
    const [selectedPetId, setSelectedPetId] = useState('');

    useEffect(() => {
        // Fetch user's pets
        fetch('https://cse471-production.up.railway.app/user-pets', {
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                setUserPets(data);
                if (id) {
                    // If coming from PetDetails, load that specific pet
                    const foundPet = data.find(p => p._id === id);
                    if (foundPet) {
                        // Ensure vetAppointments array exists
                        setPet({
                            ...foundPet,
                            vetAppointments: foundPet.vetAppointments || []
                        });
                        setSelectedPetId(id);
                    }
                } else if (data.length > 0) {
                    // Default to first pet if no specific pet ID
                    const firstPet = data[0];
                    setPet({
                        ...firstPet,
                        vetAppointments: firstPet.vetAppointments || []
                    });
                    setSelectedPetId(firstPet._id);
                }
            })
            .catch(err => console.error('Error fetching pets:', err));
    }, [id]);

    const handlePetChange = (petId) => {
        const selectedPet = userPets.find(p => p._id === petId);
        if (selectedPet) {
            // Ensure vetAppointments array exists
            setPet({
                ...selectedPet,
                vetAppointments: selectedPet.vetAppointments || []
            });
            setSelectedPetId(petId);
        }
    };

    const handleAppointmentChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment({ ...newAppointment, [name]: value });
    };

    const addVetAppointment = () => {
        if (!selectedPetId) {
            toast.error('Please select a pet first');
            return;
        }

        if (!newAppointment.doctorName || !newAppointment.dateOfAppointment) {
            toast.error('Please fill in doctor name and appointment date');
            return;
        }

        fetch(`https://cse471-production.up.railway.app/add-vet-appointment/${selectedPetId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAppointment),
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.pet && data.pet.vetAppointments) {
                    // Get the newly added appointment (last item in the array)
                    const newAppointment = data.pet.vetAppointments[data.pet.vetAppointments.length - 1];
                    // Ensure vetAppointments array exists and add the new appointment
                    const updatedAppointments = [...(pet.vetAppointments || []), newAppointment];
                    setPet({ ...pet, vetAppointments: updatedAppointments });
                    setNewAppointment({ doctorName: '', address: '', dateOfAppointment: '', notes: '' });
                    toast.success('Vet appointment added successfully');
                } else {
                    toast.error('Failed to add appointment');
                }
            })
            .catch(err => {
                console.error('Error adding vet appointment:', err);
                toast.error('Error adding vet appointment');
            });
    };

    const cancelAppointment = (appointmentId) => {
        if (!appointmentId) {
            toast.error('Invalid appointment ID');
            return;
        }

        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            fetch(`https://cse471-production.up.railway.app/delete-vet-appointment/${selectedPetId}/${appointmentId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
                .then((res) => {
                    if (!res.ok) {
                        return res.json().then(errorData => {
                            throw new Error(errorData.message || 'Failed to cancel appointment');
                        });
                    }
                    return res.json();
                })
                .then((data) => {
                    toast.success('Appointment cancelled successfully');
                    setPet({
                        ...pet,
                        vetAppointments: pet.vetAppointments.filter((a) => a._id !== appointmentId),
                    });
                })
                .catch((err) => {
                    console.error('Error cancelling appointment:', err);
                    toast.error(err.message || 'Error cancelling appointment');
                });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 py-8">
            <ToastContainer />
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-8">
                    <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text mb-8 text-center">
                        🏥 Veterinary Appointment Management
                    </h1>

                    {/* Pet Selection - Only show if not coming from specific pet */}
                    {!id && (
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-purple-700 mb-3">Select Pet:</label>
                            <select
                                value={selectedPetId}
                                onChange={(e) => handlePetChange(e.target.value)}
                                className="w-full p-4 border border-purple-200 rounded-xl bg-purple-50/50 focus:outline-none focus:ring-3 focus:ring-purple-300/50 focus:border-purple-400 transition-all duration-200"
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
                        <div className="mb-8 p-4 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl border border-purple-200">
                            <h2 className="text-xl font-bold text-purple-700">
                                Managing appointments for: <span className="text-purple-900">{pet.name}</span>
                            </h2>
                            <p className="text-purple-600 mt-1">Breed: {pet.breed}</p>
                        </div>
                    )}

                    {selectedPetId && (
                        <>
                            {/* Current Appointments */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-purple-700 mb-4">Upcoming Appointments for {pet.name}</h2>
                                {pet.vetAppointments && pet.vetAppointments.length > 0 ? (
                                    <div className="grid gap-4">
                                        {pet.vetAppointments.filter(appointment => appointment && appointment.doctorName).map((appointment, index) => (
                                            <div key={appointment._id || index} className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-purple-800 text-lg">Dr. {appointment.doctorName || 'Unknown Doctor'}</h3>
                                                        <p className="text-purple-600">📍 {appointment.address || 'No address'}</p>
                                                        <p className="text-purple-600">📅 {appointment.dateOfAppointment ? new Date(appointment.dateOfAppointment).toLocaleDateString() : 'No date'}</p>
                                                        {appointment.notes && (
                                                            <p className="mt-2 text-gray-600 italic">📝 {appointment.notes}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex flex-col items-end space-y-2">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                            appointment.dateOfAppointment && new Date(appointment.dateOfAppointment) > new Date() 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {appointment.dateOfAppointment && new Date(appointment.dateOfAppointment) > new Date() ? 'Upcoming' : 'Past'}
                                                        </span>
                                                        {/* Cancel Button - Only show for upcoming appointments */}
                                                        {appointment.dateOfAppointment && new Date(appointment.dateOfAppointment) > new Date() && (
                                                            <button
                                                                onClick={() => cancelAppointment(appointment._id)}
                                                                className="px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center space-x-1 whitespace-nowrap"
                                                            >
                                                                <span>❌</span>
                                                                <span>Cancel</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-purple-600/70">
                                        <p className="text-lg">No appointments scheduled for {pet.name}</p>
                                        <p className="text-sm">Book the first appointment below</p>
                                    </div>
                                )}
                            </div>

                            {/* Add New Appointment */}
                            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200">
                                <h2 className="text-2xl font-bold text-purple-700 mb-6">Book New Appointment</h2>
                                <div className="grid gap-4">
                                    <input
                                        type="text"
                                        name="doctorName"
                                        value={newAppointment.doctorName}
                                        onChange={handleAppointmentChange}
                                        placeholder="Doctor Name (e.g., Dr. Smith)"
                                        className="w-full p-4 border border-purple-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-purple-300/50 focus:border-purple-400 transition-all duration-200"
                                    />
                                    <input
                                        type="text"
                                        name="address"
                                        value={newAppointment.address}
                                        onChange={handleAppointmentChange}
                                        placeholder="Clinic Address"
                                        className="w-full p-4 border border-purple-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-purple-300/50 focus:border-purple-400 transition-all duration-200"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-purple-600 mb-2">Appointment Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            name="dateOfAppointment"
                                            value={newAppointment.dateOfAppointment}
                                            onChange={handleAppointmentChange}
                                            className="w-full p-4 border border-purple-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-purple-300/50 focus:border-purple-400 transition-all duration-200"
                                        />
                                    </div>
                                    <textarea
                                        name="notes"
                                        value={newAppointment.notes}
                                        onChange={handleAppointmentChange}
                                        placeholder="Notes (optional - reason for visit, special instructions, etc.)"
                                        rows="3"
                                        className="w-full p-4 border border-purple-200 rounded-xl bg-white focus:outline-none focus:ring-3 focus:ring-purple-300/50 focus:border-purple-400 transition-all duration-200"
                                    />
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={addVetAppointment}
                                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                                    >
                                        📅 Book Appointment
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

export default VetAppointment;

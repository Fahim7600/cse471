import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../provider/Authprovider';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LocationPicker from './LocationPicker';
import bg from '../../assets/bg.jpg';
import "../UserCSS/EditUserProfile.css";

const EditUserProfile = () => {
    const { userInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        contactInfo: '',
        image: '',
        location: {
            address: '',
            latitude: null,
            longitude: null
        }
    });
    const [loading, setLoading] = useState(true);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

    useEffect(() => {
        if (!userInfo?._id) {
            console.error('User ID is missing.');
            return;
        }

        fetch(`http://localhost:3000/profile/${userInfo._id}`)
            .then((response) => response.json())
            .then((data) => {
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    contactInfo: data.contactInfo || '',
                    image: data.image || '',
                    location: {
                        address: data.location?.address || '',
                        latitude: data.location?.latitude || null,
                        longitude: data.location?.longitude || null
                    }
                });
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching profile data:', error);
                setLoading(false);
            });
    }, [userInfo?._id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLocationSelect = (locationData) => {
        setProfile(prev => ({
            ...prev,
            location: {
                address: locationData.address,
                latitude: locationData.lat,
                longitude: locationData.lon
            }
        }));
        setShowLocationPicker(false);
        toast.success('Location selected successfully!');
    };

    const handleSaveProfile = async () => {
        try {
            const response = await fetch(`http://localhost:3000/profile/${userInfo._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profile)
            });

            if (response.ok) {
                toast.success('Profile updated successfully!');
                setTimeout(() => {
                    navigate('/userprofile');
                }, 2000);
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    if (!userInfo) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center" style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div className="text-red-500">User information is missing. Please log in again.</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center" style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center" style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="container flex items-center justify-center min-h-screen">
                <div className="edit-profile-card">
                    <div className="edit-profile-header">
                        <h1>Edit Profile</h1>
                        <button 
                            onClick={() => navigate('/userprofile')}
                            className="back-button"
                        >
                            ← Back
                        </button>
                    </div>

                    <div className="edit-profile-form">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={profile.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={profile.email}
                                disabled
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="contactInfo">Contact Information</label>
                            <input
                                type="text"
                                id="contactInfo"
                                name="contactInfo"
                                value={profile.contactInfo}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Profile Picture URL</label>
                            <input
                                type="url"
                                id="image"
                                name="image"
                                value={profile.image}
                                onChange={handleInputChange}
                                placeholder="Enter profile picture URL"
                                className="form-input"
                            />
                            {profile.image && (
                                <div className="image-preview">
                                    <img 
                                        src={profile.image} 
                                        alt="Profile preview" 
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            marginTop: '8px',
                                            border: '2px solid rgba(168, 85, 247, 0.2)'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <div className="location-section">
                                <div className="location-display">
                                    {profile.location.address ? (
                                        <div className="current-location">
                                            <p><strong>Current Location:</strong></p>
                                            <p>{profile.location.address}</p>
                                            <p className="coordinates">
                                                Lat: {profile.location.latitude?.toFixed(6)}, 
                                                Lng: {profile.location.longitude?.toFixed(6)}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="no-location">No location set</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowLocationPicker(true)}
                                    className="location-button"
                                >
                                    📍 Select Location
                                </button>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleSaveProfile}
                                className="save-button"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/userprofile')}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showLocationPicker && (
                <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    onClose={() => setShowLocationPicker(false)}
                    initialLocation={profile.location}
                />
            )}
        </div>
    );
};

export default EditUserProfile;


import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../provider/Authprovider';
import { useNavigate } from 'react-router-dom';
import bg from '../../assets/bg.jpg';
import "../UserCSS/UserProfile.css";

const UserProfile = () => {
    const { userInfo } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!userInfo?._id) {
            console.error('User ID is missing.');
            return;
        }

        fetch(`http://localhost:3000/profile/${userInfo._id}`)
            .then((response) => response.json())
            .then((data) => {
                setProfile(data);
                console.log("data", data);
            })
            .catch((error) => {
                console.error('Error fetching profile data:', error);
            });
    }, [userInfo?._id]);

    const handleMissingInfo = (value) => {
        return value ? value : 'NaN';
    };

    const handleEditClick = () => {
        navigate('/user-edit-profile');
    };

    if (!userInfo) {
        return (
            <div className="min-h-screen w-full" style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}>
                <div className="container">
                    <p className="text-red-500">User information is missing. Please log in again.</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen w-full" style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}>
                <div className="container">
                    <p className="text-gray-500">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center" style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div className="container flex items-center justify-center min-h-screen">
                <div className="profile-card">
                    <div className="profile-header">
                        <h1>{handleMissingInfo(profile?.name)}'s Profile</h1>
                    </div>
                    <div className="profile-image">
                        {profile?.image && profile.image !== 'NaN' ? (
                            <img src={profile.image} alt="Profile" />
                        ) : (
                            <div style={{
                                width: '12rem',
                                height: '12rem',
                                borderRadius: '50%',
                                border: '0.25rem solid',
                                borderColor: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 50%, #81d4fa 100%)',
                                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                                position: 'relative',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <svg 
                                    width="80" 
                                    height="80" 
                                    viewBox="0 0 24 24" 
                                    fill="none"
                                    stroke="#1e40af"
                                    strokeWidth="1.5"
                                    style={{ opacity: 0.8 }}
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="profile-info">
                        <div className="flex items-center space-x-2">
                            <h2>Name:</h2>
                            <p>{handleMissingInfo(profile?.name)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <h2>Email:</h2>
                            <p>{handleMissingInfo(profile?.email)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <h2>Contact Info:</h2>
                            <p>{handleMissingInfo(profile?.contactInfo)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <h2>Location:</h2>
                            <p>{profile?.location?.address ? profile.location.address : 'Not set'}</p>
                        </div>
                    </div>
                    <button onClick={handleEditClick} className="edit-button">
                        Edit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
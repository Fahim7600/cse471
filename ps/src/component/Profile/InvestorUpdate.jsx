


import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../provider/Authprovider';
import { useNavigate } from 'react-router-dom'; // Import for navigation

const InvestorUpdate = () => {
    const { userInfo } = useContext(AuthContext);
    const navigate = useNavigate();
// console.log('a',userInfo._id);
// console.log('b',userInfo.id);

    // Set initial profile data state from the userInfo
    const [profileData, setProfileData] = useState({
        name: userInfo?.name || '',
        // email: userInfo?.email || '',
        contactInfo: userInfo?.contactInfo || '',
        image: userInfo?.image || '',
        documents: userInfo?.documents || '',
    });

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:3000/profile/${userInfo?._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Profile updated successfully!');
                // Optionally navigate to another page after successful update
                navigate('/user-home');
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    return (
        <div className="min-h-screen p-6 bg-base-200">
            {/* Profile Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-green-600">
                    Update {userInfo?.name}'s Profile
                </h1>
            </div>

            {/* Profile Update Form */}
            <form onSubmit={handleSubmit} className="max-w-3xl p-6 mx-auto space-y-6 rounded-lg shadow-lg bg-base-100">
                {/* Name field */}
                <div className="form-group">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 text-sm border-gray-300 rounded-md shadow-sm input input-bordered focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Email and Contact Info fields (side by side) */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* <div className="form-group">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 text-sm border-gray-300 rounded-md shadow-sm input input-bordered focus:ring-green-500 focus:border-green-500"
                        />
                    </div> */}

                    <div className="form-group">
                        <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">Contact Info</label>
                        <input
                            type="text"
                            id="contactInfo"
                            name="contactInfo"
                            value={profileData.contactInfo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 text-sm border-gray-300 rounded-md shadow-sm input input-bordered focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* Image URL field */}
                <div className="form-group">
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                    <input
                        type="text"
                        id="image"
                        name="image"
                        value={profileData.image}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 text-sm border-gray-300 rounded-md shadow-sm input input-bordered focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* Documents URL field */}
                <div className="form-group">
                    <label htmlFor="documents" className="block text-sm font-medium text-gray-700">Documents URL</label>
                    <input
                        type="text"
                        id="documents"
                        name="documents"
                        value={profileData.documents}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 text-sm border-gray-300 rounded-md shadow-sm input input-bordered focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                <button type="submit" className="btn btn-success">Update Profile</button>
            </form>
        </div>
    );
};

export default InvestorUpdate;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import bg from '../../assets/bg.jpg';

const EditPetProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState({
        name: '',
        description: '',
        image: ''
    });
    const [loading, setLoading] = useState(true);
    const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'file'

    useEffect(() => {
        fetch(`http://localhost:3000/pets/${id}`)
            .then(res => res.json())
            .then(data => {
                setPet(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching pet details:', err);
                setLoading(false);
            });
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPet({ ...pet, [name]: value });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            fetch('http://localhost:3000/upload-pet-image', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
            .then(res => res.json())
            .then(data => {
                if (data.imageUrl) {
                    setPet({ ...pet, image: data.imageUrl });
                    toast.success('Image uploaded successfully!');
                } else {
                    toast.error('Failed to upload image');
                }
            })
            .catch(err => {
                console.error('Error uploading image:', err);
                toast.error('Failed to upload image');
            });
        }
    };

    const updatePetProfile = () => {
        fetch(`http://localhost:3000/update-pet/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pet),
            credentials: 'include'
        })
            .then(res => res.json())
            .then(() => {
                toast.success('Pet profile updated successfully!');
                setTimeout(() => {
                    navigate(`/pet/${id}`);
                }, 2000);
            })
            .catch(err => {
                console.error('Error updating pet profile:', err);
                toast.error('Failed to update pet profile');
            });
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center" style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}>
                <div className="text-gray-500">Loading pet profile...</div>
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
                <div style={editProfileCardStyle}>
                    <div style={editProfileHeaderStyle}>
                        <h1 style={titleStyle}>Edit Pet Profile</h1>
                        <button 
                            onClick={() => navigate(`/pet/${id}`)}
                            style={backButtonStyle}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                                e.target.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                            }}
                        >
                            ← Back
                        </button>
                    </div>

                    <div style={editProfileFormStyle}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Pet Name</label>
                            <input
                                type="text"
                                name="name"
                                value={pet.name}
                                onChange={handleInputChange}
                                placeholder="Enter pet's name"
                                style={formInputStyle}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgb(168, 85, 247)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Description</label>
                            <textarea
                                name="description"
                                value={pet.description}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Describe your pet (max 70 words)"
                                maxLength="350"
                                style={{...formInputStyle, resize: 'vertical', minHeight: '80px'}}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgb(168, 85, 247)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <span style={noteStyle}>Max 70 words</span>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Pet Image</label>
                            <div style={imageUploadSectionStyle}>
                                <div style={toggleSectionStyle}>
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('url')}
                                        style={{
                                            ...toggleButtonStyle,
                                            ...(uploadMethod === 'url' ? activeToggleStyle : {})
                                        }}
                                    >
                                        � Image URL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUploadMethod('file')}
                                        style={{
                                            ...toggleButtonStyle,
                                            ...(uploadMethod === 'file' ? activeToggleStyle : {})
                                        }}
                                    >
                                        📁 Upload File
                                    </button>
                                </div>
                                
                                {uploadMethod === 'url' ? (
                                    <input
                                        type="text"
                                        name="image"
                                        value={pet.image}
                                        onChange={handleInputChange}
                                        placeholder="Enter image URL"
                                        style={formInputStyle}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'rgb(168, 85, 247)';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e5e7eb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                ) : (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={fileInputStyle}
                                    />
                                )}
                            </div>
                            {pet.image && (
                                <div style={imagePreviewStyle}>
                                    <img 
                                        src={pet.image} 
                                        alt="Pet preview" 
                                        style={previewImageStyle}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div style={formActionsStyle}>
                            <button
                                onClick={updatePetProfile}
                                style={saveButtonStyle}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                🐾 Update Profile
                            </button>
                            <button
                                onClick={() => navigate(`/pet/${id}`)}
                                style={cancelButtonStyle}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modern styling inline styles to match EditUserProfile
const editProfileCardStyle = {
    width: '100%',
    maxWidth: '480px',
    padding: '1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    backdropFilter: 'blur(20px)',
    margin: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.2)'
};

const editProfileHeaderStyle = {
    marginBottom: '1.5rem',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
};

const titleStyle = {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'transparent',
    background: 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(139, 92, 246) 50%, rgb(124, 58, 237) 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    margin: '0'
};

const backButtonStyle = {
    backgroundColor: 'transparent',
    color: 'rgb(107, 114, 128)',
    border: '1px solid rgba(107, 114, 128, 0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
};

const editProfileFormStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
};

const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem'
};

const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.25rem'
};

const formInputStyle = {
    padding: '0.75rem 1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#111827',
    transition: 'all 0.2s ease',
    background: 'white',
    outline: 'none'
};

const noteStyle = {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: '0.25rem'
};

const formActionsStyle = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid rgba(229, 231, 235, 0.5)'
};

const saveButtonStyle = {
    background: 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(124, 58, 237) 100%)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    flex: '1',
    boxShadow: '0 2px 4px rgba(168, 85, 247, 0.2)'
};

const cancelButtonStyle = {
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: '1px solid rgba(107, 114, 128, 0.2)',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    flex: '1'
};

const imageUploadSectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    borderRadius: '8px',
    border: '1px solid rgba(229, 231, 235, 0.5)'
};

const toggleSectionStyle = {
    display: 'flex',
    backgroundColor: 'rgba(229, 231, 235, 0.3)',
    borderRadius: '8px',
    padding: '4px',
    gap: '4px'
};

const toggleButtonStyle = {
    flex: '1',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    color: '#6b7280'
};

const activeToggleStyle = {
    backgroundColor: 'white',
    color: 'rgb(168, 85, 247)',
    fontWeight: '600',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
};

const fileInputStyle = {
    padding: '0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '0.875rem',
    color: '#111827',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
};

const imagePreviewStyle = {
    marginTop: '0.75rem',
    display: 'flex',
    justifyContent: 'center'
};

const previewImageStyle = {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: '8px',
    border: '2px solid rgba(168, 85, 247, 0.2)',
    objectFit: 'cover'
};

export default EditPetProfile;

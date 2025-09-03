import React from 'react';
import { Link } from 'react-router-dom';
import { getPetImageUrl, handleImageError } from '../../utils/imageUtils';
import { IoMale, IoFemale } from 'react-icons/io5';
import "../UserCSS/PetCard.css";

const PetCard = ({ pet }) => {
    if (!pet) {
        return null;
    }

    const {
        _id,
        name,
        age,
        breed,
        gender,
        image,
        description
    } = pet;

    return (
        <div className="pet-card">
            <div className="pet-card-image-container">
                <img 
                    src={getPetImageUrl(image)} 
                    alt={name} 
                    className="pet-card-image"
                    onError={handleImageError}
                    loading="lazy"
                />
            </div>
            <div className="pet-card-content">
                <div className="mb-2">
                    <div className="flex items-center justify-center gap-2 text-center">
                        <h2 className="pet-card-title flex items-center justify-center w-full text-center">
                            {name}
                            {gender === 'Male' ? (
                                <IoMale className="w-5 h-5 text-blue-500 ml-2 align-middle" style={{verticalAlign: 'middle'}} />
                            ) : gender === 'Female' ? (
                                <IoFemale className="w-5 h-5 text-pink-500 ml-2 align-middle" style={{verticalAlign: 'middle'}} />
                            ) : (
                                <span className="text-gray-500 text-sm ml-2 align-middle" style={{verticalAlign: 'middle'}}>?</span>
                            )}
                        </h2>
                    </div>
                    <p className="text-gray-600 text-sm text-center w-full">{breed}</p>
                </div>
                <p className="pet-card-description mb-3 text-center w-full">{description}</p>
                <div className="pet-card-details">
                    <p className="pet-card-detail">
                        <span>Age:</span> {age}
                    </p>
                        <p className="pet-card-detail">
                            <span>Gender:</span> {gender}
                        </p>
                </div>
                <Link
                    to={`/pet/${_id}`}
                    className="pet-card-link"
                >
                    View Profile
                </Link>
            </div>
        </div>
    );
};

export default PetCard;

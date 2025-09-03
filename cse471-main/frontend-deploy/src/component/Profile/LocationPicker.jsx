import React, { useState, useEffect, useRef } from 'react';
import './LocationPicker.css';

const LocationPicker = ({ onLocationSelect, onClose, initialLocation, title = "Select Your Location", subtitle }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
    const [loading, setLoading] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const searchTimeoutRef = useRef(null);

    // Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentPosition({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting current location:', error);
                }
            );
        }
    }, []);

    // Debounced search function
    useEffect(() => {
        if (searchQuery.length > 2) {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            
            searchTimeoutRef.current = setTimeout(() => {
                searchLocations(searchQuery);
            }, 300);
        } else {
            setSearchResults([]);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery]);

    const searchLocations = async (query) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching locations:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const useCurrentLocation = async () => {
        if (!currentPosition) {
            alert('Current location not available. Please allow location access.');
            return;
        }

        setLoading(true);
        try {
            // Reverse geocoding to get address from coordinates
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentPosition.lat}&lon=${currentPosition.lon}&addressdetails=1`
            );
            const data = await response.json();
            
            const locationData = {
                address: data.display_name || 'Current location',
                lat: data.lat ? parseFloat(data.lat) : null,
                lon: data.lon ? parseFloat(data.lon) : null
            };
            
            setSelectedLocation(locationData);
        } catch (error) {
            console.error('Error getting current location address:', error);
            alert('Failed to get current location address');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        const locationData = {
            address: location.display_name || 'Unknown location',
            lat: location.lat ? parseFloat(location.lat) : null,
            lon: location.lon ? parseFloat(location.lon) : null
        };
        setSelectedLocation(locationData);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleConfirmLocation = () => {
        if (selectedLocation && selectedLocation.lat && selectedLocation.lon) {
            onLocationSelect(selectedLocation);
        }
    };

    return (
        <div className="location-picker-overlay">
            <div className="location-picker-modal">
                <div className="location-picker-header">
                    <div className="header-content">
                        <h2>{title}</h2>
                        {subtitle && <p className="subtitle">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                <div className="location-picker-content">
                    <div className="search-section">
                        <div className="search-input-container">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for a location (city, address, landmark...)"
                                className="search-input"
                            />
                            {loading && <div className="search-loading">Searching...</div>}
                        </div>

                        <button
                            onClick={useCurrentLocation}
                            className="current-location-button"
                            disabled={!currentPosition || loading}
                        >
                            📍 Use Current Location
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <h3>Search Results:</h3>
                            {searchResults.map((location, index) => (
                                <div
                                    key={index}
                                    className="search-result-item"
                                    onClick={() => handleLocationSelect(location)}
                                >
                                    <div className="result-name">{location.display_name}</div>
                                    <div className="result-coordinates">
                                        Lat: {location.lat ? parseFloat(location.lat).toFixed(4) : 'N/A'}, 
                                        Lng: {location.lon ? parseFloat(location.lon).toFixed(4) : 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedLocation && (
                        <div className="selected-location">
                            <h3>Selected Location:</h3>
                            <div className="location-details">
                                <p><strong>Address:</strong> {selectedLocation.address}</p>
                                <p><strong>Coordinates:</strong> {
                                    selectedLocation.lat && selectedLocation.lon 
                                        ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lon.toFixed(6)}`
                                        : 'Coordinates not available'
                                }</p>
                            </div>
                        </div>
                    )}

                    <div className="location-picker-actions">
                        <button
                            onClick={handleConfirmLocation}
                            disabled={!selectedLocation || !selectedLocation.lat || !selectedLocation.lon}
                            className="confirm-button"
                        >
                            Confirm Location
                        </button>
                        <button onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationPicker;

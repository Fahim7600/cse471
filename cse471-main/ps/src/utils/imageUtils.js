/**
 * Utility function to get the correct image URL for pet images
 * Handles both uploaded files and external URLs
 * @param {string} imageUrl - The image URL from the database
 * @returns {string} - The correct full URL for displaying the image
 */
export const getPetImageUrl = (imageUrl) => {
    if (!imageUrl) {
        // Return a default placeholder image if no image is provided
        return '/api/placeholder/300/300?text=No+Image';
    }
    
    // Check if it's already a full URL (starts with http:// or https://)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }
    
    // Check if it's a relative path for uploaded files (starts with /uploads/)
    if (imageUrl.startsWith('/uploads/')) {
        return `http://localhost:3000${imageUrl}`;
    }
    
    // If it doesn't start with /uploads/ but also isn't a full URL,
    // assume it's an uploaded file and add the server prefix
    if (imageUrl.startsWith('uploads/') || imageUrl.includes('pet-')) {
        return `http://localhost:3000/${imageUrl}`;
    }
    
    // If none of the above, treat as external URL
    return imageUrl;
};

/**
 * Utility function to handle image load errors
 * @param {Event} event - The error event from the img element
 */
export const handleImageError = (event) => {
    console.warn('Image failed to load:', event.target.src);
    event.target.src = '/api/placeholder/300/300?text=Image+Not+Found';
};

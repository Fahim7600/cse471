import React, { useContext, useState } from 'react';
import { AuthContext } from '../../provider/Authprovider';
import Swal from 'sweetalert2';

const Addpet = () => {
  const { user } = useContext(AuthContext);
  const [errorMsg, setErrorMsg] = useState('');
  const [imageOption, setImageOption] = useState('url');
  const [imagePreview, setImagePreview] = useState('');

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setImagePreview(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    
    if (!user || !user.id) {
      Swal.fire('Error', 'You must be logged in to add a pet.', 'error');
      return;
    }

    const form = event.target;
    const formData = new FormData();

    formData.append('name', form.name.value);
    formData.append('dob', form.dob.value);
    formData.append('breed', form.breed.value);
    formData.append('gender', form.gender.value);
    formData.append('description', form.description.value);
    formData.append('owner', user.id);

    // Validate and handle image
    if (imageOption === 'url') {
      const imageUrl = form.imageUrl.value;
      if (imageUrl) {
        // Basic validation for image URL
        if (!imageUrl.match(/\.(jpeg|jpg|gif|png)$/i) && !imageUrl.includes('unsplash.com') && !imageUrl.includes('pexels.com')) {
          setErrorMsg('Please enter a direct image URL (ending with .jpg, .png, .gif) or a valid Unsplash/Pexels image URL');
          setTimeout(() => setErrorMsg(''), 4000);
          return;
        }
        formData.append('imageUrl', imageUrl);
      }
    } else {
      const imageFile = form.imageFile.files[0];
      if (imageFile) {
        // Validate file size and type
        if (imageFile.size > 5 * 1024 * 1024) {
          setErrorMsg('Image file must be smaller than 5MB');
          setTimeout(() => setErrorMsg(''), 4000);
          return;
        }
        if (!imageFile.type.startsWith('image/')) {
          setErrorMsg('Please select a valid image file');
          setTimeout(() => setErrorMsg(''), 4000);
          return;
        }
        formData.append('petImage', imageFile);
      }
    }

    try {
      console.log('Sending request to add pet...');
      console.log('Form data contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key + ':', value);
      }

      const response = await fetch('http://localhost:3000/add-pet', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies/session
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        Swal.fire('Success!', 'Pet profile added successfully!', 'success');
        form.reset();
        setImageOption('url');
        setImagePreview('');
      } else {
        console.error('Server error:', result);
        setErrorMsg(result.message || 'Something went wrong!');
        setTimeout(() => setErrorMsg(''), 4000);
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      setErrorMsg('Network error. Please try again.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 pt-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-2">
            Add Pet Profile
          </h1>
          <p className="text-slate-600 text-sm">Share your beloved pet with our community</p>
        </div>

        {/* Form Card */}
        <div className="relative overflow-hidden shadow-xl bg-gradient-to-br from-blue-500/90 to-purple-600/90 backdrop-blur-lg border border-white/20 rounded-2xl">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          
          <div className="relative z-10 p-6">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-xl">
                <p className="text-red-100 text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-5" encType="multipart/form-data">
              {/* Pet Name */}
              <div className="space-y-1.5">
                <label className="block text-white font-semibold text-sm">Pet Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter your pet's name"
                  className="w-full px-3 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="block text-white font-semibold text-sm">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  required
                  className="w-full px-3 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                />
              </div>

              {/* Breed and Gender Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-white font-semibold text-sm">Breed</label>
                  <input
                    type="text"
                    name="breed"
                    required
                    placeholder="e.g., Golden Retriever"
                    className="w-full px-3 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-white font-semibold text-sm">Gender</label>
                  <select
                    name="gender"
                    required
                    className="w-full px-3 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                  >
                    <option value="" className="text-slate-800">Select Gender</option>
                    <option value="Male" className="text-slate-800">Male</option>
                    <option value="Female" className="text-slate-800">Female</option>
                  </select>
                </div>
              </div>

              {/* Pet Image Section */}
              <div className="space-y-3">
                <label className="block text-white font-semibold text-sm">Pet Image</label>
                
                {/* Image Option Toggle */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageOption"
                      value="url"
                      checked={imageOption === 'url'}
                      onChange={(e) => setImageOption(e.target.value)}
                      className="w-4 h-4 text-white border-white/30 bg-white/20 focus:ring-white/50"
                    />
                    <span className="text-white font-medium text-sm">Image URL</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageOption"
                      value="file"
                      checked={imageOption === 'file'}
                      onChange={(e) => setImageOption(e.target.value)}
                      className="w-4 h-4 text-white border-white/30 bg-white/20 focus:ring-white/50"
                    />
                    <span className="text-white font-medium text-sm">Upload File</span>
                  </label>
                </div>

                {/* Image Input */}
                {imageOption === 'url' ? (
                  <div className="space-y-1.5">
                    <input
                      type="url"
                      name="imageUrl"
                      placeholder="https://example.com/your-pet.jpg"
                      onChange={handleImageUrlChange}
                      className="w-full px-3 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                      required={imageOption === 'url'}
                    />
                    <div className="text-white/70 text-xs">
                      <p>• Enter a direct image URL (ending with .jpg, .png, .gif)</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <input
                        type="file"
                        name="imageFile"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/30 file:text-white hover:file:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300"
                        required={imageOption === 'file'}
                      />
                    </div>
                    <p className="text-white/70 text-xs">Max file size: 5MB (JPEG, PNG, GIF)</p>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="space-y-1.5">
                    <label className="block text-white font-semibold text-sm">Image Preview</label>
                    <div className="flex justify-center">
                      <div className="relative overflow-hidden rounded-xl border border-white/30 bg-white/10 p-2 w-32 h-32">
                        <img
                          src={imagePreview}
                          alt="Pet preview"
                          className="w-full h-full object-cover rounded-lg"
                          onError={() => setImagePreview('')}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-white font-semibold text-sm">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  placeholder="Tell us something special about your pet..."
                  maxLength="350"
                  className="w-full px-3 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 resize-none"
                ></textarea>
                <p className="text-white/70 text-xs">Maximum 70 words</p>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button 
                  type="submit" 
                  className="w-full py-3 px-5 bg-gradient-to-r from-white/20 to-white/30 backdrop-blur-sm border border-white/40 rounded-xl text-white font-bold shadow-lg hover:from-white/30 hover:to-white/40 hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  Add Pet Profile
                </button>
              </div>
            </form>
          </div>

          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
          <div className="absolute top-1/2 left-0 w-10 h-10 bg-blue-300/20 rounded-full -translate-y-1/2 -translate-x-6 blur-sm"></div>
          <div className="absolute top-1/3 right-0 w-8 h-8 bg-purple-300/20 rounded-full -translate-y-1/2 translate-x-8 blur-sm"></div>
          <div className="absolute bottom-1/4 right-0 w-12 h-12 bg-pink-300/20 rounded-full translate-y-8 translate-x-10 blur-sm"></div>
          <div className="absolute top-0 left-1/2 w-6 h-6 bg-blue-200/30 rounded-full -translate-x-1/2 -translate-y-4 blur-sm"></div>
          <div className="absolute bottom-0 left-1/2 w-8 h-8 bg-purple-200/30 rounded-full -translate-x-1/2 translate-y-6 blur-sm"></div>
        </div>
      </div>
    </div>
  );
};

export default Addpet;

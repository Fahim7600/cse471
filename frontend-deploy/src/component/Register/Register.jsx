import React, { useContext, useState } from 'react';
import { AuthContext } from '../../provider/Authprovider';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'; // Eye icon for password visibility
import Swal from 'sweetalert2';
import image from "../../assets/landing1.jpg";

const Register = () => {
    const [errorMsg, setErrorMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); // new state for success
    const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility toggle
    const [userType, setUserType] = useState('user'); // state to hold user type
    const { createNewUser, user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        const form = new FormData(e.target);
        const name = form.get('name');  // Get username
        const email = form.get('email');
        const password = form.get('password');
        const info = { name, email, password, role: userType }; // Create an object to send to the server

        fetch('https://cse471-production.up.railway.app/signup', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(info)
        })
            .then(res => res.json())
            .then(data => {
                if (data.insertedId) {
                    // Custom Success Pop-up with SweetAlert2
                    Swal.fire({
                        title: 'Success!',
                        text: 'You have been successfully registered.',
                        confirmButtonText: 'Cool',
                        confirmButtonColor: '#3B82F6', 
                        background: 'rgba(255, 255, 255, 0.8)', 
                        width: '400px', 
                        padding: '1.5rem', 
                        borderRadius: '10px', 
                        backdrop: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)', 
                        showClass: {
                            popup: 'animate__animated animate__fadeIn'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOut'
                        },
                        customClass: {
                            popup: 'rounded-lg shadow-lg'
                        }
                    }).then(() => {
                        setIsSuccess(true);
                        // Redirect to login page after successful registration
                        navigate('/login');
                    });
                } else if (data.message) {
                    setErrorMsg(data.message); 
                }
            })
            .catch(err => {
                console.error('Fetch error:', err);
                setErrorMsg('Something went wrong during registration.');
            });
    };

    const handlePasswordMismatch = () => {
        const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
        confirmPasswordInput.setCustomValidity("Passwords do not match!");
        confirmPasswordInput.reportValidity();
    };

    const clearCustomValidity = (e) => {
        e.target.setCustomValidity("");
    };

    return (
        <div className="min-h-screen hero flex items-center justify-center sm:justify-start px-6 sm:px-12 lg:px-64" style={{ 
            backgroundImage: `url(${image})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
        }}>
            <div className="w-full max-w-sm lg:max-w-md shadow-lg rounded-xl bg-gradient-to-br from-blue-50/90 to-white/90 backdrop-blur-lg p-8 space-y-6 ml-0 sm:ml-0 md:ml-2 lg:ml-4 xl:ml-8 border border-blue-200/30">
                <h3 className="text-3xl font-semibold text-center bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Register</h3> 
                <form onSubmit={(e) => {
                    const form = e.target;
                    const password = form.password.value;
                    const confirmPassword = form.confirmPassword.value;
                    if (password !== confirmPassword) {
                        e.preventDefault();
                        handlePasswordMismatch();
                    } else {
                        handleSubmit(e);
                    }
                }} className="space-y-4">
                    <div className="form-control">
                        <label className="label text-blue-700"> 
                            <span className="label-text font-medium">Username</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Username"
                            className="input input-bordered bg-white/70 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-gray-700 p-3 w-full"
                            required
                            aria-label="Username"
                        />
                    </div>
                    <div className="form-control">
                        <label className="label text-blue-700"> 
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="input input-bordered bg-white/70 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-gray-700 p-3 w-full"
                            required
                            aria-label="Email"
                        />
                    </div>
                    <div className="form-control relative">
                        <label className="label text-blue-700"> 
                            <span className="label-text font-medium">Password</span>
                        </label>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            className="input input-bordered bg-white/70 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-gray-700 p-3 w-full pr-12"
                            required
                            aria-label="Password"
                        />
                        <div
                            className="absolute right-3 top-[calc(50%+16px)] transform -translate-y-1/2 cursor-pointer flex justify-center items-center"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? <HiOutlineEyeOff size={24} color="#1d4ed8" /> : <HiOutlineEye size={24} color="#1d4ed8" />}
                        </div>
                    </div>
                    <div className="form-control relative">
                        <label className="label text-blue-700"> 
                            <span className="label-text font-medium">Confirm Password</span>
                        </label>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            className="input input-bordered bg-white/70 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-gray-700 p-3 w-full pr-12"
                            required
                            aria-label="Confirm Password"
                            onInvalid={handlePasswordMismatch}
                            onInput={clearCustomValidity}
                        />
                    </div>

                    <div className="mt-6 form-control">
                        <button
                            type="submit"
                            className="w-full py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 text-lg font-semibold shadow-lg"
                        >
                            Register
                        </button>
                    </div>
                    <div>
                        {errorMsg && <p className="mt-2 text-red-500">{errorMsg}</p>}
                        {isSuccess && <p className="mt-2 text-green-500">Successful</p>}
                    </div>
                </form>
                <p className="text-center text-sm text-blue-700">
                    Already have an account?{' '}
                    <Link to='/login' className="text-blue-600 hover:text-blue-800 underline font-medium">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

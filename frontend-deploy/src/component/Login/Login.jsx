import React, { useContext, useState } from 'react';
import { AuthContext } from '../../provider/Authprovider';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import image from "../../assets/landing1.jpg";

const Login = () => {
    const [errorMsg, setErrorMsg] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const form = new FormData(e.target);
        const email = form.get('email');
        const password = form.get('password');

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server did not return JSON. Maybe a redirect or error page?");
            }

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                setIsSuccess(true);
                setErrorMsg('');

                if (data.user.role === 'user') {
                    navigate('/user-home');
                } else if (data.user.role === 'admin') {
                    navigate('/admin-home');
                } else {
                    navigate('/');
                }
            } else {
                setErrorMsg(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrorMsg(error.message);
            setIsSuccess(false);
        }
    };

    return (
        <div className="min-h-screen hero flex items-center justify-center sm:justify-start px-6 sm:px-12 lg:px-64" style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div className="w-full max-w-sm lg:max-w-md shadow-lg rounded-xl bg-gradient-to-br from-blue-50/90 to-white/90 backdrop-blur-lg p-8 space-y-6 ml-0 border border-blue-200/30">
                <h3 className="text-3xl font-semibold text-center bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Login</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label text-blue-700">
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <input
                            type="email"
                            name="email"
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
                            aria-label="Password"
                            autoComplete="current-password" // Added autocomplete attribute
                            className="input input-bordered bg-white/70 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-gray-700 p-3 w-full pr-12"
                            required
                        />
                        <div
                            className="absolute right-3 top-[calc(50%+16px)] transform -translate-y-1/2 cursor-pointer flex justify-center items-center"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                        >
                            {passwordVisible ? <HiOutlineEyeOff size={24} color="#1d4ed8" /> : <HiOutlineEye size={24} color="#1d4ed8" />}
                        </div>
                    </div>
                    <div className="form-control mt-4">
                        <button
                            type="submit"
                            className="w-full py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition duration-300 text-lg font-semibold shadow-lg"
                        >
                            Login
                        </button>
                    </div>
                    {errorMsg && <p className="text-red-500 text-center mt-2">{errorMsg}</p>}
                    {isSuccess && <p className="text-green-500 text-center mt-2">Login Successful!</p>}
                </form>
                <p className="text-center text-sm text-blue-700">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:text-blue-800 underline font-medium">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

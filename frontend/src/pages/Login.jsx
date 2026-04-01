import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Login page for the application.
 * @param {token} props - the browser token
 * @param {setToken} props - function to set the browser token
 * @param {setRole} props - function to set the user role
 * @param {setIsSubscribed} props - function to set the user subscription status
 * @returns {JSX.Element} - the login form
 */

function Login(props){

    // Create state variables for email and password
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: ""
    });
    const [errorMessage, setErrorMessage] = useState('');

    // Get the function to navigate to different pages
    const navigate = useNavigate();

    useEffect(() => {
        if (props.token !== null && props.token !== undefined) {
            // Redirect to projections page if user is a manager
            if (props.role === "manager") {
                navigate("/user-details");
            }
            // Redirect to journeys page if user is a customer and is subscribed
            else if (props.role === "customer" && props.isSubscribed) {
                navigate("/journeys");
            }
            // Redirect to payments page if user is a customer and is not subscribed
            else if (props.role === "customer" && !props.isSubscribed) {
                navigate("/new-subscription");
            }
        }
    }, [props.token, navigate]);

    // Called whenever user presses login button
    async function loginUser(event) {
        event.preventDefault();
    
        // Check all fields have been filled in 
        if (loginForm.email === "" || loginForm.password === "") {
            setErrorMessage("Please fill in all fields.");
            return;
        }
        // Attempt to login the user with current credentials
        const token = await sendLoginRequest();
    
        if (token) {
            // Set the browser token and clear the error message
            setErrorMessage('');
    
            // After login, check user role and subscription status
            const role = await checkUserRole(token); 
            const subscriptionStatus = await checkUserSubscriptionStatus(token);

            // Update role and subscription status across the app
            props.setRole(role);
            localStorage.setItem('role', role);
            props.setIsSubscribed(subscriptionStatus);
            localStorage.setItem('isSubscribed', subscriptionStatus);
            props.setToken(token);
        }
    }
    
    // Send a login request to the server
    async function sendLoginRequest() {
        try {
            const response = await axios.post("/login",
                {"email": loginForm.email,
                    "password": loginForm.password});
    
            // Clear the form
            setLoginForm({
                email: "",
                password: ""
            });
    
            // Return the token
            return response.data.access_token;
    
        } catch (error) {
            if (error.response) {
                // Set the error message to display to the user
                setErrorMessage(error.response.data.message);
            }
        }
    }

    // Check whether the user is a customer or manager
    async function checkUserRole(token) {
        const response = await axios.get("/check_user_role", {
            headers: {Authorization: 'Bearer ' + token}
        }).catch(error => {
                console.error(error);
        });
        return response.data.user_role;
    }

    // Check if the user is subscribed
    async function checkUserSubscriptionStatus(token) {

        const response = await axios.get("/check_user_sub_status",
            {headers: {Authorization: 'Bearer ' + token}}
        ).catch(error => {
                console.error(error);
        });
        return response.data.subscribed === "true";
    }

    // Update the state when the user types in the form
    function handleChange(event){
        const {value, name} = event.target;
        setLoginForm(prevValue => ({
                ...prevValue, [name]: value
            })
        )}

    return (
        <div className='flex flex-col md:flex-row w-full min-h-screen bg-PinPoint'>
            <div className='flex flex-col items-center justify-center w-full md:w-1/2'>
                <h1 className='font-semibold text-white'>Your journey continues..</h1>
                <h2 className='text-white'>Log in to continue your journey!</h2>
                <img src="/images/PinPointMap.png" alt="PinPoint Map" className='w-[300px] h[300px] md:w-[600px] md:h-[600px]'/>
            </div>
            <div className='w-full md:w-1/2'>
                <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto my-auto md:h-screen lg:py-0'>
                    <div className="w-full bg-white rounded-xl shadow md:mt-0 sm:max-w-md xl:p-0">
                        <div className='p-6 space-y-6 sm:p-8'>
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Sign In 
                            </h1>
                            {errorMessage && <p className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-rose-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20"
                                                 fill="currentColor">
                                                <path fillRule="evenodd"
                                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                            {errorMessage}
                                        </p>}
                            <form className="login">
                                <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                                    <input onChange={handleChange} 
                                    type="email"
                                    id="email"
                                    name="email"
                                    className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5'
                                    placeholder="Email" 
                                    value={loginForm.email} />
                                </div>
                                <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                                <input onChange={handleChange} 
                                        type="password"
                                        id="password"
                                        name="password" 
                                        className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5'
                                        placeholder="Password" 
                                        value={loginForm.password} />
                                </div>
                            </form>
                            <button className="w-full text-white font-semibold bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none hover:bg-blue-300 rounded-lg text-sm px-5 py-2.5 text-center" onClick={loginUser}>Log in</button>
                            <p className="text-sm flex items-center justify-center font-light text-gray-500 py-3">
                            New to PinPoint?
                                <a href="/register" className="font-medium text-blue-600 hover:underline ml-2 no-underline">Sign Up here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

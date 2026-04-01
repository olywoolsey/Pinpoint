import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import axios from 'axios';

/**
 * Register page for the application.
 * @param {token} props - the browser token
 * @param {setToken} props - function to set the browser token
 * @param {setRole} props - function to set the user role
 * @param {setIsSubscribed} props - function to set the user subscription status
 * @returns {JSX.Element} - the register form
*/

function Register(props){
    // Create state variables for email, username, and password
    const [registerForm, setRegisterForm] = useState({
        email: "",
        username: "",
        password: "",
        password2: ""
    });
    const [errorMessage, setErrorMessage] = useState('');
    // Get the function to navigate to different pages
    const navigate = useNavigate();
    // If the token is not null, redirect the user to the home page
    useEffect(() => {
        if (props.token !== null && props.token !== undefined && !props.isSubscribed){
            navigate("/new-subscription");
        }
        else if (props.token !== null && props.token !== undefined && props.isSubscribed){
            navigate("/journeys");
        }
    }, [props.token, navigate, props.isSubscribed]);

    // Send a POST request to the server to register the user
    function registerUser(event){
        event.preventDefault();
        // Check the validation rules
        if (!checkValidationRules(registerForm.email, registerForm.username, registerForm.password, registerForm.password2)){
            return;
        }

        // Send the POST request to the server
        axios.post("/register", {
            "email": registerForm.email,
            "username": registerForm.username,
            "password": registerForm.password})
        // If the request is successful, set the token and clear the error message
        .then(response => {
            props.setToken(response.data.access_token);
            setErrorMessage('');

        }).catch(error => {
            if (error.response) {
                // Set the error message to display to the user
                setErrorMessage(error.response.data.message);
            }
        });
        // Clear the form
        setRegisterForm({
            email: "",
            username: "",
            password: "",
            password2: ""
        });
        // Set the role to customer and subscription status to false
        props.setRole("customer");
        localStorage.setItem('role', 'customer');
        props.setIsSubscribed(false);
        localStorage.setItem('isSubscribed', false);
    }

    // Update the state when the user types in the form
    function handleChange(event){
        const {value, name} = event.target;
        setRegisterForm(prevValue => ({
                ...prevValue, [name]: value
            })
        )}

    function checkValidationRules(email, username, password1, password2){
        // Check all fields have been filled in
        if (email === "" || username === "" || password1 === "" || password2 === ""){
            setErrorMessage("Please fill in all fields.");
            return false;
        }
        // Check the email is valid
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)){
            setErrorMessage("Please enter a valid email address.");
            return false;
        }
        // Check the username is a valid length
        if (username.length < 3 || username.length > 20){
            setErrorMessage("Username must be between 3 and 20 characters long.");
            return false;
        }
        // Check the passwords are valid lengths
        if (password1.length < 8 || password1.length > 30){
            setErrorMessage("Password must be between 8 and 30 characters long.");
            return false;
        }
        // Check the passwords match
        if (password1 !== password2){
            setErrorMessage("Passwords do not match.");
            return false;
        }
        return true;
    }
    
    // Render the register form
    return (
            <div className='flex flex-col md:flex-row w-full md:h-screen bg-PinPoint'>
                <div className='flex flex-col items-center justify-center w-full md:w-1/2'>
                    <h1 className='font-semibold text-white'>Your journey starts here..</h1>
                    <h2 className='text-white'>Sign up to start your journey!</h2>
                    <img src="/images/PinPointMap.png" alt="PinPoint Map" className='w-[300px] h[300px] md:w-[600px] md:h[600px]'/>
                </div>
                <div className='w-full md:w-1/2'>
                    <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto my-auto md:h-screen lg:py-0'>
                        <div className="w-full bg-white rounded-xl shadow md:mt-0 sm:max-w-md xl:p-0">
                            <div className='p-6 space-y-6 sm:p-8'>
                                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Create an account
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
                                <form className="register">
                                    <div>
                                        <label for="email" className="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                                        <input onChange={handleChange}
                                            id = "email"
                                            type="email"
                                            name="email"
                                            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
                                            placeholder="Email"
                                            value={registerForm.email}/><br></br>
                                        {}
                                    </div>
                                    <div>
                                        <label for="username" className="block mb-2 text-sm font-medium text-gray-900">Username</label>  
                                        <input onChange={handleChange}
                                            type="text"
                                            id = "username"
                                            name="username"
                                            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
                                            placeholder="Username"
                                            value={registerForm.username} /><br></br>
                                        {} 
                                    </div>
                                    <div>
                                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900">Password</label>
                                        <input onChange={handleChange} 
                                            type="password"
                                            id = "password"
                                            name="password"
                                            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
                                            placeholder="***********"
                                            value={registerForm.password} /><br></br>
                                            {}
                                    </div>
                                    <div>
                                        <label for="password2" class="block mb-2 text-sm font-medium text-gray-900">Confirm password</label>
                                        <input onChange={handleChange} 
                                            type="password"
                                            id = "password2"
                                            name="password2"
                                            className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5'
                                            placeholder="***********"
                                            value={registerForm.password2} /><br></br>
                                            {}
                                    </div>
                                    <button className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none hover:bg-blue-300 font-semibold rounded-lg text-sm px-5 py-2.5 text-center" onClick={registerUser}>Create an account</button>
                                    <p className="text-sm flex items-center justify-center font-light text-gray-500 py-3">
                                    Already have an account? 
                                    <a href="/login" class="font-medium text-blue-600 hover:underline ml-2 no-underline">Login here</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;

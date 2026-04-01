import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as response from "autoprefixer";

response.data.access_token = undefined;

/**
 * Account page for the application.
 * @param {token} props - the browser token
 * @param {setToken} props - function to set the browser token
 * @returns {JSX.Element} - the account page
 */

function Account(props) {

    // State to manage the button click
    const [isButtonClicked, setIsButtonClicked] = useState(false);
    const [isPassButtonClicked, setIsPassButtonClicked] = useState(false);

    // Create state variables for the user data
    const [welcomeData, setWelcomeData] = useState(null)
    const [subscriptionData, setSubscriptionData] = useState(null);

    // State to manage the display of the form
    const [usernameForm, setUsernameForm] = useState(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
    const [usernameSuccessMessage, setUsernameSuccessMessage] = useState('');
    const [passwordForm, setPasswordForm] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');

    // State to manage the input value
    const [username, setUsername] = useState('');
    const [currentPassword, setcurrentPassword] = useState('');
    const [newPassword1, setNewPassword1] = useState('');
    const [newPassword2, setNewPassword2] = useState('');
    const navigate = useNavigate();


    // Handler for changing the input
    const handleInputChange = (e) => {
        setUsername(e.target.value);
    };
    const HandleCurrentPassword = (e) => {
        setcurrentPassword(e.target.value);
    };
    const HandleNewPassword1 = (e) => {
        setNewPassword1(e.target.value);
    };
    const HandleNewPassword2 = (e) => {
        setNewPassword2(e.target.value);
    };

    const  DeleteAccount = () => {
        const userConfirmed = window.confirm("Are you sure you want to delete account?");
        if (userConfirmed) {
            axios.post("/delete_account", {},
                {headers: {Authorization: 'Bearer ' + props.token}})
                .then(() => {
                    props.removeToken()
                })
                .catch(error => {
                    console.error("Error deleting account", error);
                });
            navigate('/');
        }
    };

    const  DeleteSubscription = () => {
        const userConfirmed = window.confirm("Are you sure you want to cancel your subscription?");
        if (userConfirmed) {
            axios.post("/delete_subscription", {},
                {headers: {Authorization: 'Bearer ' + props.token}})
                .then(() => {
                    props.setIsSubscribed(false)
                })
                .catch(error => {
                    console.error("Error deleting susbcription", error);
                });
            navigate('/new-subscription');
        }
    };

    const UsernameChange = (e) => {
        e.preventDefault();
        if (username.length < 3 || username.length > 20) {
            setUsernameErrorMessage('Username must be between 3 and 20 characters long');
            return;
        }
        axios.post("/change_username",
            {new_username: username},
            { headers: {Authorization: 'Bearer ' + props.token}})
            // If the request is successful, set the token
            .then(response => {
                if (response.data.access_token){
                    props.setToken(response.data.access_token);
                }
                setUsernameErrorMessage('');
                setUsernameSuccessMessage('Username changed successfully.');
            }).catch(error => {
            if (error.response) {
                setUsernameErrorMessage(error.response.data.message);
                setUsernameSuccessMessage('');
            }
        });
    };

    const PasswordChange = (e) => {
        e.preventDefault();
        if (newPassword1.length < 8 || newPassword1.length > 20) {
            setPasswordErrorMessage('Password must be between 8 and 20 characters long');
            return;
        }
        if (newPassword1 !== newPassword2) {
            setPasswordErrorMessage('Passwords do not match');
            return;
        }
        const changePassword = () =>{
            axios.post("/change_password",
                {"current_password": currentPassword,
                    "new_password": newPassword1},
                {headers: {Authorization: 'Bearer ' + props.token}})
                .then(response => {
                    if (response.data.access_token){
                        props.setToken(response.data.access_token);
                    }
                    setPasswordErrorMessage('');
                    setPasswordSuccessMessage('Password changed successfully.');
                }).catch(error => {
                if (error.response) {
                    setPasswordErrorMessage(error.response.data.message);
                    setPasswordSuccessMessage('');
                }
            });
        };
        changePassword();
    };

    useEffect(() => {
        // Send a GET request to the server to get the welcome data for the logged in user
        const getWelcomeData = () =>{
            axios.get("/welcome", {headers: {Authorization: 'Bearer ' + props.token}})
            .then((response) => {
                const data = response.data;
                // If the data contains an access token, set the token (previous token expired)
                if (data.access_token){
                    props.setToken(data.access_token)
                }
                // Set the welcome data to the user's name
                setWelcomeData(({
                    name: data.name
                }))

            }).catch((error) => {
                if (error.response) {
                    console.log(error.response.data);
                }
            })
        };
        getWelcomeData();
    }, [props, props.token]);

    useEffect(() => {
        // Send a GET request to the server to get the subscription details for the logged in user
        const getSubscriptionDetails = () =>{
            axios.get("/get_subscription_details", {headers: {Authorization: 'Bearer ' + props.token}})
            .then((response) => {
                const data = response.data;
                // If the data contains an access token, set the token (previous token expired)
                if (data.access_token){
                    props.setToken(data.access_token)
                }
                // Set the subscription details to the state
                setSubscriptionData(data.subscription)

            }).catch((error) => {
                if (error.response) {
                    console.log(error.response.data);
                }
            })
        };
        getSubscriptionDetails();

    }, [props, props.token]);

    // Render the account page
    return (
        <div>
            <div className="w-screen min-h-screen bg-PinPoint pb-10">
                <div className="mx-8 min-h-screen max-w-screen-xl sm:mx-8 xl:mx-auto">
                    {/* <div className="grid grid-cols-8 pt-3 sm:grid-cols-10"> */}
                    <div className="flex flex-col items-center justify-center min-h-screen w-full">

                        <div className="overflow-hidden rounded-xl bg-gray-50 p-4 sm:px-8 sm:shadow w-full">
                            <div className="pt-4">
                                <h1 className="py-2 text-2xl font-semibold">Account Settings</h1>
                                {welcomeData !== null && (<p className='text-gray-600'>Welcome {welcomeData.name}!</p>)}
                            </div>

                            <hr className="mt-4 mb-8"/>
                            <h2 className="py-2 text-xl font-semibold">Edit Account</h2>

                            {!isButtonClicked && (
                                <button
                                    className="px-8 py-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                                    onClick={() => {
                                        setUsernameForm(true);
                                        setIsButtonClicked(true);
                                    }}
                                >
                                    Change Username
                                </button>
                            )}
                            <div className="flex items-center">
                                <div className="flex flex-col space-y-2  sm:space-y-0 sm:space-x-3">
                                    {usernameForm && (
                                        <>
                                            {usernameErrorMessage && 
                                                <p className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-rose-600 mt-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20"
                                                        fill="currentColor">
                                                        <path fillRule="evenodd"
                                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"/>
                                                    </svg>
                                                    {usernameErrorMessage}
                                                </p>
                                            }
                                            {usernameSuccessMessage && 
                                                <p className="inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-green-600 mt-3">
                                                   <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {usernameSuccessMessage}
                                                </p>
                                            }
                                            <div>
                                                <form onSubmit={UsernameChange}>
                                                    <label htmlFor="username"
                                                        className='text-sm text-gray-500'>New username</label>
                                                    <div
                                                        className="relative flex overflow-hidden rounded-md border-2 transition focus-within:border-blue-600">
                                                        <input
                                                            id="username"
                                                            type="text"
                                                            value={username}
                                                            className='w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none'
                                                            placeholder={welcomeData.name}
                                                            onChange={handleInputChange}
                                                        /><br></br>
                                                        {}
                                                    </div>
                                                    <button className="mt-4 rounded-lg bg-blue-600 hover:bg-blue-500 py-2 px-4 text-white font-semibold"
                                                        type="submit">Save Username
                                                    </button>
                                                </form>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <hr className="mt-4 mb-8"/>
                            {!isPassButtonClicked && (
                                <button
                                    className="px-8 py-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                                    onClick={() => {
                                        setPasswordForm(true);
                                        setIsPassButtonClicked(true);
                                    }}
                                >
                                    Change Password
                                </button>
                            )}
                            <div className="flex items-center">
                                <div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-3">
                                    {passwordForm && (
                                        <>
                                            {passwordErrorMessage && 
                                                <p className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-rose-600 mt-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20"
                                                        fill="currentColor">
                                                        <path fillRule="evenodd"
                                                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"/>
                                                    </svg>
                                                    {passwordErrorMessage}
                                                </p>
                                            }
                                            {passwordSuccessMessage && 
                                                <p className="inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-green-600 mt-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {passwordSuccessMessage}
                                                </p>
                                            }
                                            <form onSubmit={PasswordChange}>
                                                <label htmlFor="currentPassword"
                                                    className='text-sm text-gray-500'>Current password</label>
                                                <div
                                                    className="relative flex overflow-hidden rounded-md border-2 transition focus-within:border-blue-600">
                                                    <input
                                                        id="currentPassword"
                                                        type="password"
                                                        value={currentPassword}
                                                        className='w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none'
                                                        placeholder='***********'
                                                        onChange={HandleCurrentPassword}
                                                    /><br></br>
                                                    {}
                                                </div>
                                                <label className="text-sm text-gray-500" htmlFor="newPassword1">New password</label>
                                                {}
                                                <div
                                                    className="relative flex overflow-hidden rounded-md border-2 transition focus-within:border-blue-600">
                                                    <input
                                                        id="newPassword1"
                                                        type="password"
                                                        value={newPassword1}
                                                        className='w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none'
                                                        placeholder='***********'
                                                        onChange={HandleNewPassword1}
                                                    /><br></br>
                                                </div>
                                                <label className="text-sm text-gray-500" htmlFor="newPassword2">Confirm new password</label>
                                                {}
                                                <div
                                                    className="relative flex overflow-hidden rounded-md border-2 transition focus-within:border-blue-600">
                                                    <input
                                                        id="newPassword2"
                                                        type="password"
                                                        value={newPassword2}
                                                        className='w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none'
                                                        placeholder='***********'
                                                        onChange={HandleNewPassword2}
                                                    /><br></br>
                                                </div>
                                                <button className="mt-4 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-white font-semibold"
                                                    type="submit">Save New Password
                                                </button>
                                            </form>
                                        </>
                                    )}
                                </div>
                            </div>

                            <hr className="mt-4 mb-8"/>
                            <div>
                                {subscriptionData && (
                                    <div>
                                        <h2 className="py-2 text-xl font-semibold">Subscription Details</h2>

                                        <p>Status: {subscriptionData.status}</p>
                                        <p>Price: {subscriptionData.plan.amount / 100} {subscriptionData.plan.currency.toUpperCase()}</p>
                                        <p>Next Payment
                                            Date: {new Date(subscriptionData.current_period_end * 1000).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>
                            {props.isSubscribed ? (
                                <div>
                                    <div className="mb-10">
                                        <p className="mt-5 py-2 text-xl font-semibold">Change Subscription</p>
                                        <p>Alter your Subscription to a different plan:</p>
                                        <button className="mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-3 text-white font-semibold"
                                                onClick={() => navigate('/change-subscription')}>Change Subscription
                                        </button>
                                    </div>
                                    <div className="mb-10">
                                        <p className="py-2 text-xl font-semibold">Cancel Subscription</p>
                                        <p className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-[#90132E]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20"
                                                 fill="currentColor">
                                                <path fillRule="evenodd"
                                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                      clipRule="evenodd"/>
                                            </svg>
                                            Proceed with caution
                                        </p>
                                        <p className="mt-2">There is no way to access your journeys after this action.</p>
                                        <button className="ml-auto text-sm font-semibold text-[#90132E] underline decoration-2"
                                                onClick={() => DeleteSubscription()}>Cancel Subscription
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-10">
                                    <p className="py-2 text-xl font-semibold">Buy Subscription</p>
                                    <p className="mt-2">Subscribe to access the rest of the app</p>
                                    <button className="mt-4 rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold"
                                            onClick={() => navigate('/new-subscription')}>Buy Subscription
                                    </button>
                                </div>
                            )}
                            <hr className="mt-4 mb-8"/>
                            <div className="mb-10">
                                <p className="py-2 text-xl font-semibold">Delete Account</p>
                                <p className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-[#90132E]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20"
                                         fill="currentColor">
                                    <path fillRule="evenodd"
                                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                              clipRule="evenodd"/>
                                    </svg>
                                    Proceed with caution
                                </p>
                                <p className="mt-2">There is no way to access your account after this action.</p>
                                <button className="ml-auto text-sm font-semibold text-[#90132E] underline decoration-2"
                                        onClick={() => DeleteAccount()}>Delete Account
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Account;

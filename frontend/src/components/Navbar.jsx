import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

/**
 * Displays the navigation bar at the top of the page.
 * @param {token} props - the token
 * @param {role} props - the role of the user
 * @param {setRole} props - the function to set the role of the user
 * @param {isSubscribed} props - whether the user is subscribed
 * @param {setIsSubscribed} props - the function to set whether the user is subscribed
 * @param {removeToken} props - the function to remove the token
 * @returns {JSX.Element} - the navigation bar
 */

function Navbar(props) {
    //Toggle for the hamburger menu in mobile view 
    const [toggle, setToggle] = useState(false);
    
    const handleToggle = () => {
        setToggle(!toggle);
    };

    function handleLinkClick() {
        // Automatically collapse the mobile menu when a link is clicked
        setToggle(false);
    }

    const [navbarColour, setNavbarColour] = useState(props.role === 'manager' ? 'bg-blue-800' : 'bg-PinPoint');
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/'|| location.pathname === '/login' || location.pathname === '/register') {
            setNavbarColour('bg-PinPoint');
        } else {
            setNavbarColour(props.role === 'manager' ? 'bg-blue-800' : 'bg-PinPoint');
        }
    }, [location.pathname, props.role]);

   
    useEffect(() => {
        // Check whether the user is a customer or manager
        async function checkUserRole() {
            const response = await axios.get("/check_user_role", {headers: {
                        Authorization: 'Bearer ' + props.token,
            }})
                .catch(error => {
                    console.error(error);
            });
            props.setRole(response.data.user_role);
        }

        // Check if the user is subscribed
        async function checkUserSubscriptionStatus() {
            const response = await axios.get(
                "/check_user_sub_status", {
                headers: {
                    Authorization: 'Bearer ' + props.token,
                }})
                .catch(error => {
                    console.error(error);

            });
            props.setIsSubscribed(response.data.subscribed === "true");
        }

        if (location.pathname !== "/login" && location.pathname !== "/register" && location.pathname !== "/") {
            if (props.token !== null && props.token !== undefined) {
                checkUserRole();
                checkUserSubscriptionStatus();
            }
        }
    }, [location, props, props.isSubscribed]);

    function logout() {
        axios.post("/logout")
            .then((response) => {
                console.log(response);
                props.removeToken();
                localStorage.removeItem('role');
                localStorage.setItem('role', '')
                localStorage.removeItem('isSubscribed');
                localStorage.setItem('isSubscribed', false)
            }).catch((error) => {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            console.log(error.config);
        });
    }

    return (
        <nav>
            <div className={navbarColour}>
                {/* For Desktop */}
                <div className='md:max-w-[1480px] max-w-[600px] m-auto w-full h-full flex justify-between items-center'>
                    <Link to = '/'><img src={"/images/pinpoint.png"} alt="PinPoint Logo" className='h-[75px]'/></Link>
                    <div className='hidden md:flex items-center'>
                    <ul className="nav flex gap-4">
                        {/* Public Navbar */}
                        {(props.token === null || props.token === undefined) && (
                            <>
                            <li className="nav"><Link to="/login"    className='flex justify-between items-center border rounded-md border-white bg-transparent px-6 gap-2 text-white no-underline font-semibold text-xl'>Login</Link></li>
                            <li className="nav"><Link to="/register" className='px-4 py-2 rounded-md bg-blue-600 font-bold text-white no-underline hover:no-underline hover:bg-blue-800 text-xl'>Register</Link></li>
                            </>
                            )
                        }
                        {/* Logged in Customer Navbar */}
                        {props.token !== null && props.token !== undefined && props.role === "customer" && (
                            <>
                            {props.isSubscribed && <>
                            <li className="nav"><Link to="/journeys" className='flex justify-between items-center text-white no-underline font-semibold hover:no-underline text-xl'>Journeys</Link></li>
                            <li className="nav"><Link to="/friends"  className='flex justify-between items-center text-white no-underline font-semibold hover:no-underline text-xl'>Friends</Link></li></>}
                            <li className="nav"><Link to="/account"  className='flex justify-between items-center text-white no-underline font-semibold hover:no-underline text-xl'>Account</Link></li>
                            <li className="nav"><Link to="/"         className='px-4 py-2 rounded-md bg-blue-600 font-bold text-white no-underline hover:bg-blue-800 hover:no-underline text-xl' onClick={logout}>Logout</Link></li>
                            </>
                            )
                        }
                        {/* Manager Navbar */}
                        {/* isCust returns whether user is customer or not (boolean) */}
                        {props.token !== null && props.token !== undefined && props.role === "manager" && (
                            <>
                            <li className="nav"><Link to="/user-details" className='flex justify-between items-center text-white no-underline font-semibold hover:no-underline text-xl'>User Details</Link></li>
                            <li className="nav"><Link to="/projections" className='flex justify-between items-center text-white no-underline font-semibold hover:no-underline text-xl'>Revenue Projections</Link></li>
                            <li className="nav"><Link to="/"            className='flex justify-between items-center border rounded-md border-white bg-transparent px-6 gap-2 text-white no-underline font-semibold text-xl' onClick={logout}>Logout</Link></li>
                            </>
                            )
                        }
                    </ul>
                    </div>

                    {/* Toggle */}
                    <div className='md:hidden' onClick={handleToggle}>
                        <img src={toggle?"/images/close.svg":"/images/menu.svg"} alt="Menu" className='h-[50px]'/>
                    </div>

                </div>

               
                {/* For Mobile */}
                <div className={`${toggle ? 'absolute z-[1006] p-4 bg-PinPoint w-full px-8 md:hidden' : 'hidden'} ${navbarColour}`}>                    <ul>
                    {(props.token === null || props.token === undefined) && (
                        <>
                        <div className='flex flex-col my-4 gap-4'>
                            <li className="nav">
                                <div className='flex justify-between items-center'>
                                    <Link to="/" className='text-white no-underline font-bold hover:no-underline' onClick={handleLinkClick}> 
                                        <span className='flex items-center'>
                                            <img src={"/images/pinpoint.png"} alt="PinPoint Logo" className='h-[75px]'/>
                                            <h3 className='ml-2 font-bold'>PinPoint Homepage</h3>
                                        </span>
                                    </Link>
                                </div>
                            </li>
                            <li className="nav">
                                <Link to="/login" className='w-full py-4 no-underline border-2 border-white gap-2 text-white text-center rounded-md font-bold hover:bg-green-500 hover:no-underline' 
                                onClick={handleLinkClick}>Login
                                </Link>
                            </li>
                            <li className="nav">
                                <Link to="/register" className='w-full py-4 no-underline text-center rounded-md bg-PinPoint-blue text-white font-bold hover:bg-blue-500 hover:no-underline'
                                onClick={handleLinkClick}>Register
                                </Link>
                            </li>
                        </div>
                        </>
                        )
                    }
                        {props.token !== null && props.token !== undefined && props.role === "customer" && (
                            <>
                            {props.isSubscribed && <>
                            <li className="nav p-3"><Link to="/journeys" className='text-white no-underline font-semibold' onClick={handleLinkClick}>Journeys</Link></li>
                            <li className="nav p-3"><Link to="/friends"  className='text-white no-underline font-semibold' onClick={handleLinkClick}>Friends</Link></li></>}
                            <li className="nav p-3"><Link to="/account"  className='text-white no-underline font-semibold' onClick={handleLinkClick}>Account</Link></li>
                            <li className="nav p-3">
                                <Link to="/" className="w-full py-4 no-underline border-2 border-white gap-2 text-white text-center rounded-md font-bold hover:bg-green-500 hover:no-underline"
                                onClick={logout}>Logout
                                </Link>
                            </li>
                            </>
                            )
                        }
                        {props.token !== null && props.token !== undefined && props.role === "manager" && (
                            <>
                            <li className="nav p-3"><Link to="/user-details" className='text-white no-underline font-semibold' onClick={handleLinkClick}>User Details</Link></li>
                            <li className="nav p-3"><Link to="/projections" className='text-white no-underline font-semibold' onClick={handleLinkClick}>Revenue Projections</Link></li>
                            <li className="nav p-3">
                                <Link to="/" className='w-full py-4 no-underline border-2 border-white gap-2 text-white text-center rounded-md font-bold hover:bg-green-500 hover:no-underline' 
                                onClick={logout}>Logout
                                </Link>
                            </li>
                            </>
                            )
                        }
                    </ul>
                </div>

         {/* Semi-transparent overlay */}
            {toggle && (
                    <div className="fixed inset-0 bg-black opacity-50" onClick={handleToggle}></div>
                )}
        </div>
        </nav>
    );
}

export default Navbar;
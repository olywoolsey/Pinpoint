import React from 'react';
import axios from 'axios';
import '../App.css';
import {loadStripe} from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';

/**
 * Page for users to subscribe to PinPoint.
 * @param {token} props - the token
 * @returns {JSX.Element} - the subscription page
 */

// Stripe promise to load the stripe object
const stripePromise = loadStripe('pk_test_51Omg9mC2Liz4wwk2KbYDgpL2uqucPHXKp1O6mkHFT4XccD4wssTe9BrLb2NH2nJJM2Jk9PK11xwLdUZTW44l6PDN00VzP4uOe7');

function Payments(props) {
    const navigate = useNavigate();
    const handleButtonClick = async (subscription_type) => {
        console.log("Button clicked" + subscription_type);
        // Send a POST request to the backend to subscribe the user to the selected plan
        const response = await axios.post("/create_checkout_session",
            {subscription_type: subscription_type},
            {headers: {
                    Authorization: 'Bearer ' + props.token}
            });

        // Get the session ID from the response
        const sessionId = response.data.session_id;
        // Redirect the user to the Stripe Checkout page
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({sessionId});
        if (error) {
            console.error('Error:', error);
        }
        else {
            navigate("/journeys");
        }
    }
    return (
      <div className='w-full min-h-screen py-[6rem] px-4 bg-light-bg'>
        <h1 className='text-5xl font-bold text-black text-center mb-8'>Subscriptions</h1>
        <div className='max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8'>
          <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 bg-white'>
            <h2 className='text-2xl font-bold text-center py-8'>Weekly</h2>
            <h3 className='text-center text-5xl font-bold'>£2.00/w</h3>
            <div className='text-center font-medium'>
              <p className='py-2 mx-8 mt-8'>The weekly subsciption is great for those who want something short-term!</p>
            </div>
            
            <button className='bg-PinPoint text-white w-[200px] rounded-md  my-6 mx-auto px-6 py-3 hover:bg-green-500 font-semibold'
              onClick = {() => handleButtonClick("weekly")}>
              Subscribe for a Week
            </button>
          </div>

          <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 bg-white'>
            <h2 className='text-2xl font-bold text-center py-8'>Monthly</h2>
            <h3 className='text-center text-5xl font-bold'>£7.00/m</h3>
            <div className='text-center font-medium'>
              <p className='py-2 mx-8 mt-8'>Monthly members save more! Join today to start PinPointing!</p>
            </div>
            <button className='bg-PinPoint text-white w-[200px] rounded-md my-6 mx-auto px-6 py-3 hover:bg-green-500 font-semibold'
              onClick = {() => handleButtonClick("monthly")}>
              Subscribe for a Month
            </button>
          </div>

          <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 bg-white'>
            <h2 className='text-2xl font-bold text-center py-8'>Annually</h2>
            <h3 className='text-center text-5xl font-bold'>£80.00/a</h3>
            <div className='text-center font-medium'>
              <p className='py-2 mx-8 mt-8'>Dive straight in and enjoy PinPoint's features ALL. YEAR. LONG.</p>
            </div>
            <button className='bg-PinPoint text-white w-[200px] rounded-md my-6 mx-auto px-6 py-3 hover:bg-green-500 font-semibold'
              onClick = {() => handleButtonClick("annually")}>
              Subscribe for a Year
            </button>
          </div>
        </div>
      </div>
    )
}

export default Payments;
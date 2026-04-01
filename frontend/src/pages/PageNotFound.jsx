import React from "react";
import { Link } from 'react-router-dom';

/**
 * Page displayed when a user tries to access a page that does not exist.
 * @returns {JSX.Element} - the 404 page
*/
 
function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-PinPoint">
    <div className="bg-white rounded-xl w-11/12 sm:w-10/12 py-4 h-full sm:min-h-[800px]">
      <h1 className="text-5xl font-bold mt-8">404 - Page Not Found</h1>
      <Link to ="/"><img src ="/images/pinpoint.png" alt="PinPoint" className="mt-4 w-[150px] mx-auto" /></Link>
      <h1 className="text-5xl font-bold mt-4">Oops!</h1>
      <h2 className="text-2xl text-center font-semibold mt-16">Looks like you're lost :( </h2>
      <h2 className="text-2xl text-center font-semibold mt-8">The page you are looking for might have been removed, had its name changed or is temporarily unavailable.</h2>
      <h2 className="text-2xl text-center font-semibold mt-8">Luckily, PinPoint is here to keep track of where you've been!</h2>
      <Link to ="/"><h2 className="text-2xl text-black text-center font-semibold mt-16">Click here to get back to the good stuff</h2></Link>

    </div>
  </div>
  );
}
 
export default PageNotFound;

import {useState} from 'react';

/**
 * Provides functions to get, save and remove tokens from local storage.
 * @returns {Object} - Object containing the token, a function to save 
 * the token and a function to remove the token
 */

function UseToken() {
    
    // Get the token from local storage
    function getToken() {
        const userToken = localStorage.getItem('token');
        // If the token exists, return it
        return userToken || null;
    }

    // Create a state variable to hold the token
    const [token, setToken] = useState(getToken());

    // Save the token passed as parameter to local storage
    function saveToken(userToken) {
        localStorage.setItem('token', userToken);
        // Set the token state variable to the same value
        setToken(userToken);
    }

    // Remove the token from local storage
    function removeToken() {
        localStorage.removeItem('token');
        // Set the token state variable to null
        setToken(null);
    }

    // Return the token and associated functions
    return {
        // setToken is assigned to the saveToken function - saveToken rather than setToken is accessed by other components
        setToken: saveToken,
        removeToken,
        token
    }
}

export default UseToken;
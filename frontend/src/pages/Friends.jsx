import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Friends page for the application.
 * @param {token} props - the browser token
 * @param {setToken} props - function to set the browser token
 * @returns {JSX.Element} - the friends page
 * 
*/
function Friends(props) {

    // Create state variables for friends
    const [friends, setFriends] = useState([[], [], []]);
    const [friendsUpdated, setFriendsUpdated] = useState(false);

    const [username, setUsername] = useState('');

    const handleInputChange = (e) => {
        setUsername(e.target.value);
    };

    // Get friends to display each time the page is loaded
    useEffect(() => {

        fetchFriends();

        // Async function to fetch friends list
        async function fetchFriends() {
            const friendsLists = await GetFriendsList(props);
            // Update state with fetched friends
            setFriends(friendsLists);
        }
        setFriendsUpdated(false);
    },[friendsUpdated])

    // Function to get list of the user's friends
    async function GetFriendsList(props) {
        let responseData = []
        await axios.get("/get_friends", {headers: {Authorization: 'Bearer ' + props.token}})
        .then(response => {
            // If the data contains an access token, update the token
            if (response.data.access_token){
                props.setToken(response.data.access_token);
            }
            // Store the friends list in the response data
            responseData = [response.data.current_friends, response.data.outgoing_friends, response.data.incoming_friends];
        })
        .catch(error => {
            console.error(error);
            responseData = [];
        });
        return responseData;
    }

    // Function to send a friend request
    async function sendFriendRequest(event) {
        event.preventDefault();
        axios.post("/request_friend",
            {username: username},
            {headers: {Authorization: 'Bearer ' + props.token}})
        .then(response => {
            // If the data contains an access token, update the token
            if (response.data.access_token){
                props.setToken(response.data.access_token);
            }
            // If the request was successfully sent, display a popup
            if (response.data.message === "Friend request sent"){
                alert(response.data.message);
                // Refresh the friends list
                setFriendsUpdated(true);
                // Clear the form 
                event.target.reset();
            }
            // If the request was not successfully sent, display a popup
            else{
                alert(response.data.message);
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    // Function to accept a friend request
    async function handleAccept(friend_id) {
        await axios.post("/accept_friend",
            {friend_id: friend_id},
            {headers: {
                Authorization: 'Bearer ' + props.token
        }})
        .then(response => {
            // If the data contains an access token, update the token
            if (response.data.access_token){
                props.setToken(response.data.access_token);
            }
            // If the request was successfully accepted, display a popup
            if (response.data.message === "Friend request accepted"){
                alert(response.data.message);
                // Refresh the friends list
                setFriendsUpdated(true);
            }
            // If the request was not successfully accepted, display a popup
            else{
                alert(response.data.message);
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    // Function to reject a friend request
    async function handleReject(friend_id) {
        await axios.post("/reject_friend",
            {friend_id: friend_id},
            {headers: {
                Authorization: 'Bearer ' + props.token
            }})
        .then(response => {
            // If the data contains an access token, update the token
            if (response.data.access_token){
                props.setToken(response.data.access_token);
            }
            // If the request was successfully rejected, display a popup
            if (response.data.message === "Friend request rejected"){
                alert(response.data.message);
                // Refresh the friends list
                setFriendsUpdated(true);
            }
            // If the request was not successfully rejected, display a popup
            else{
                alert(response.data.message);
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    // Function to remove a friend
    async function handleRemove(friend_id) {
    await axios.post("/remove_friend",
        {friend_id: friend_id},
        {headers: {
            Authorization: 'Bearer ' + props.token
        }})
    .then(response => {
        // If the data contains an access token, update the token
        if (response.data.access_token){
            props.setToken(response.data.access_token);
        }
        // If the request was successfully removed, display a popup
        console.log(response.data.message);
        if (response.data.message === "Friend removed successfully"){
            alert(response.data.message);
            // Refresh the friends list
            setFriendsUpdated(true);
        }
        // If the request was not successfully removed, display a popup
        else{
            console.log("Something has gone wrong");
            alert(response.data.message);
        }
    })
    .catch(error => {
        console.error(error);
    });
    }

    // Function to cancel a friend request
    async function handleCancel(friend_id) {
        await axios.post("/cancel_request",
            {friend_id: friend_id},
            {headers: {
                    Authorization: 'Bearer ' + props.token
                }})
        .then(response => {
            // If the data contains an access token, update the token
            if (response.data.access_token){
                props.setToken(response.data.access_token);
            }
            // If the request was successfully cancelled, display a popup
            if (response.data.message === "Friend request cancelled"){
                alert(response.data.message);
                // Refresh the friends list
                setFriendsUpdated(true);
            }
            // If the request was not successfully cancelled, display a popup
            else{
                alert(response.data.message);
            }
        })
        .catch(error => {
            console.error(error);
        });
    }  
        

    return (
        <div>
            <div className='overflow-x-hidden min-w-full md:min-h-screen py-[6rem] px-4 bg-PinPoint'>
                <h1 className='text-6xl text-white font-bold text-center py-6'>PinPoint Pals</h1>
                <p className='text-2xl text-white font-bold text-center py-2'>Welcome to your friends dashboard! Here's where you can add friends, accept requests, and grow your PinPoint presence!</p>
            <div className='max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8'>
                <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-xl bg-white'>
                    <h2 className='text-2xl font-bold text-center py-8'>Current Friends</h2>
                        {friends[0].length > 0 && <ul>
                            {friends[0].map(([friendID, friendName]) => {
                                return (
                                    <li key={friendID}>
                                        <div className='flex items-center pb-3'>
                                            <p className='mr-4 my-auto'>{friendName}</p>
                                            <button className='px-6 py-2 rounded-md bg-PinPoint hover:bg-green-600 text-white font-semibold' onClick={() => handleRemove(friendID)}>Remove</button>
                                        </div>
                                    </li>
                                );
                            })}</ul>}
                        {friends[0].length === 0 && <p>No friends yet</p>}
            <div className='text-center font-medium'>
            </div>
            
                </div>

      <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-xl  bg-white'>
        <h3 className='text-2xl font-bold text-center py-8'> Add Friend </h3>
            {/* form for the user to add friend by username */}
            <form onSubmit={sendFriendRequest}>
                <label htmlFor="username">Username:</label>
                <input className = "ml-2 border border-gray-300" id="username" value={username} type="text" name="username" onChange={handleInputChange} required/>
                <button className='mt-4 mx-16 px-6 py-2 rounded-md bg-PinPoint hover:bg-green-600 text-white font-semibold' type="submit">Send Friend Request</button>
            </form>
        <h2 className='text-2xl font-bold text-center py-8'>Pending Requests</h2>
        {friends[1].length > 0 && <ul>
                {friends[1].map(([friendID, friendName]) => {
                    return (
                        <li key={friendID}>
                            <div className='flex items-center pb-3'>
                                <p className='mr-4 my-auto'>{friendName}</p>
                                <button className='px-4 py-2 rounded-md bg-PinPoint hover:bg-green-600 text-white font-semibold' onClick={() => handleCancel(friendID)}>Cancel</button>
                            </div>
                        </li>
                    );
                })}
            </ul>}
        <div className='text-center font-medium'>
        </div>
       
      </div>

      <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-xl  bg-white'>
        <h2 className='text-2xl font-bold text-center py-8'>My Recieved Requests</h2>
            {friends[2].length > 0 && <ul>
                {friends[2].map(([friendID, friendName]) => {
                    return (
                        <li key={friendID}>
                            <div className='flex items-center pb-3'>
                                <p className='mr-4 my-auto'>{friendName}</p>
                                <button className='px-4 py-2 mr-2 rounded-md bg-PinPoint hover:bg-green-600 text-white font-semibold' onClick={() => handleAccept(friendID)}>Accept</button>
                                <button className='px-4 py-2 rounded-md bg-PinPoint hover:bg-green-600 text-white font-semibold' onClick={() => handleReject(friendID)}>Reject</button>
                            </div>
                        </li>
                    );
                })}
            </ul>}
            {friends[2].length === 0 && <p>No received friend requests</p>}
        <div className='text-center font-medium'>
        </div>
       
      </div>
    </div>
  </div>
</div>

    );
}

export default Friends;
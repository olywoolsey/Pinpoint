import { React, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './pages/PageNotFound';
import Home from './pages/Home';
import UserDetails from './pages/UserDetails';
import Projections from './pages/Projections';
import Journeys from './pages/Journeys';
import Account from './pages/Account';
import Payments from './pages/Payments';
import Login from './pages/Login';
import Register from './pages/Register';
import Friends from './pages/Friends';
import UseToken from './components/UseToken';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {

    // Get functions for token, role and subscription status management
    const {token, setToken, removeToken} = UseToken();
    const [role, setRole] = useState(localStorage.getItem('role') || '');
    const [isSubscribed, setIsSubscribed] = useState(JSON.parse(localStorage.getItem('isSubscribed')) || false);

    // Save the role and subscription status to local storage
    useEffect(() => {
        localStorage.setItem('role', role);
    }, [role]);
    
    useEffect(() => {
        localStorage.setItem('isSubscribed', JSON.stringify(isSubscribed));
    }, [isSubscribed]);

    // Return routes to all pages in the app
    return (
        <div className="body">
            <Router>
                <Navbar token={token} setToken={setToken} removeToken={removeToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} role={role} setRole={setRole} />
                <Routes>
                    <Route path="/" element={<Home token={token} setToken={setToken} isSubscribed={isSubscribed} role={role} />} />
                    <Route path="/journeys" element={<PrivateRoute token={token} isSubscribed={isSubscribed} role={role}><Journeys token={token} setToken={setToken} /></PrivateRoute>} />
                    <Route path="/account" element={<PrivateRoute token={token} isSubscribed={isSubscribed} role={role}><Account token={token} setToken={setToken} removeToken={removeToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed}/></PrivateRoute>} />
                    <Route path="/login" element={<Login token={token} setToken={setToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} role={role} setRole={setRole}/>} />
                    <Route path="/register" element={<Register token={token} setToken={setToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} role={role} setRole={setRole} />} />
                    <Route path="/user-details" element={<PrivateRoute token={token} isSubscribed={isSubscribed} role={role}><UserDetails token={token} setToken={setToken} /></PrivateRoute>} />
                    <Route path="/projections" element={<PrivateRoute token={token} isSubscribed={isSubscribed} role={role}><Projections token={token} setToken={setToken} /></PrivateRoute>} />
                    <Route path="/new-subscription" element={<PrivateRoute token={token} isSubscribed={isSubscribed} role={role}><Payments token={token} setToken={setToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed}/></PrivateRoute>} />
                    <Route path="/change-subscription" element={<PrivateRoute token={token} isSubscribed={isSubscribed} role={role}><Payments token={token} setToken={setToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed}/></PrivateRoute>} />
                    <Route path="/friends" element={<PrivateRoute token={token} isSubscribed={isSubscribed} role={role}><Friends token={token} setToken={setToken} isSubscribed={isSubscribed} /></PrivateRoute>} />
                    <Route path="*" element={<PageNotFound token={token} isSubscribed={isSubscribed} role={role}/>} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
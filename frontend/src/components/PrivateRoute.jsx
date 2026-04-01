import { Navigate, useLocation } from 'react-router-dom';

/**
 * Defines a route only accessible to authenticated users.
 * @param {children} props - the children of the route
 * @param {token} props - the token
 * @returns {JSX.Element} - the private route
 */

function PrivateRoute({ children, token, isSubscribed, role }) {
    const location = useLocation();
    const currentPath = location.pathname.toLowerCase();

    // Define the paths that are only accessible to signed in users
    const signedIn = ['/account'].map(path => path.toLowerCase());
    const signedInAndNotSubscribed = ['/new-subscription'].map(path => path.toLowerCase());
    const signedInAndSubscribed = ['/journeys', '/upload', '/friends', '/change-subscription'].map(path => path.toLowerCase());
    const restrictedManager = ['/projections', '/user-details'].map(path => path.toLowerCase());

    // If the user is signed in
    if (token !== null && token !== undefined) {
        // If the user is a customer and tries to access a manager restricted page
        if (role === "customer" && restrictedManager.includes(currentPath)) {
            return <Navigate to="/page-not-found" replace />;
        }
        // If the user is subscribed and tries to access a buy subscription page
        if (role === "customer" && isSubscribed && (signedInAndNotSubscribed.includes(currentPath))){
            return <Navigate to="/account" replace />;
        }
        // If the user is not subscribed and tries to access a page that requires a subscription
        if (role === "customer" && !isSubscribed && (signedInAndSubscribed.includes(currentPath))){
             return <Navigate to="/new-subscription" replace />;
        }
        // If the user is a manager and tries to access a customer restricted page
        if (role === "manager" && (signedInAndSubscribed.includes(currentPath) || signedInAndNotSubscribed.includes(currentPath) || signedIn.includes(currentPath))){
            return <Navigate to="/login" replace />;
        }
        return children;
    } else {
        if (restrictedManager.includes(currentPath)) {
            return <Navigate to="/page-not-found" replace />;
        }
        else{
            return <Navigate to="/login" replace />;
        }
    }

}

export default PrivateRoute;
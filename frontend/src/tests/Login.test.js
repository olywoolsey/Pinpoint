import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Router} from "react-router-dom";
import {expect} from '@jest/globals';
import Login from "../pages/Login";
import userEvent from "@testing-library/user-event";
import {createMemoryHistory} from 'history';
import axios from 'axios';

jest.mock("axios");


describe(Login, () => {
    let browserToken;
    let setBrowserToken;
    let setRole;
    let setIsSubscribed;
    let role;
    let isSubscribed;

    // sets the browser token for each session
    beforeEach(() => {
        browserToken = null;
        setBrowserToken = jest.fn((newBrowserToken) => {browserToken = newBrowserToken});
        role = null;
        isSubscribed = null;
        setRole = jest.fn((newRole) => {role = newRole});
        setIsSubscribed = jest.fn((newSub) => {isSubscribed = newSub})
    });

    // makes sure the login form displays the email, password and login fields
    it("All key components render", () => {
        const {container} = render(<MemoryRouter><Login /></MemoryRouter>);
        const emailBox = container.querySelector('input[type="email"]');
        const passwordBox = container.querySelector('input[type="password"]');
        const loginButton = screen.getByRole('button', {name: /Log in/i})

        expect(emailBox).toBeInTheDocument();
        expect(passwordBox).toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();
    });

    // checks that there is a link to the register page on the Login form
    it("Sign-up button", () => {
        render(<MemoryRouter><Login /></MemoryRouter>);
        const signUpButton = screen.getByText("Sign Up here");

        expect(signUpButton).toHaveAttribute('href', '/register');
    });

    // checks sending login information works and sends the correct data to the backend
    it("Login form requests", async () => {
        const {container} = render(<MemoryRouter>
            <Login setToken={setBrowserToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={browserToken}/>
        </MemoryRouter>);

        axios.post = jest.fn().mockResolvedValue({ data: { access_token: 'fake_access_token' } });
        axios.get = jest.fn().mockResolvedValue({ data: { user_role: 'customer' } });

        const emailBox = container.querySelector('input[type="email"]');
        const passwordBox = container.querySelector('input[type="password"]');
        const loginButton = screen.getByRole('button', {name: /Log in/i})

        userEvent.type(emailBox, "testing@testing.com");
        userEvent.type(passwordBox, 'testing123');

        userEvent.click(loginButton);

        await waitFor(() => {
            // checks the correct email and password are sent to the backend
            expect(axios.post).toHaveBeenCalledWith("/login", {
                email: 'testing@testing.com',
                password: 'testing123'
            });

            // checks the correct access token is sent to the backend
            expect(axios.get).toHaveBeenCalledWith("/check_user_role", {
                headers: {
                    Authorization: 'Bearer fake_access_token',
                },
            });

            expect(axios.get).toHaveBeenCalledWith("/check_user_sub_status", {
                "headers": {
                    "Authorization": "Bearer fake_access_token"
                }
            });
        });
    });

    // check logging in as a paid customer takes you to the journeys page
    it("Paid customer login", async () => {
        let routeHistory = createMemoryHistory({initialEntries:['/login']},);
        const {container, rerender} = render(<Router location={routeHistory.location} navigator={routeHistory}>
            <Login setToken={setBrowserToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={browserToken}/>
        </Router>);

        axios.post = jest.fn().mockResolvedValue({ data: { access_token: 'fake_access_token' } });
        axios.get = jest.fn().mockResolvedValue({ data: { user_role: 'customer', subscribed: "true" } });

        const emailBox = container.querySelector('input[type="email"]');
        const passwordBox = container.querySelector('input[type="password"]');
        const loginButton = screen.getByRole('button', {name: /Log in/i})

        userEvent.type(emailBox, "customer@pinpoint.com");
        userEvent.type(passwordBox, 'customer123');

        await userEvent.click(loginButton);

        // wait until the tokens have been set
        await waitFor(async () => {});

        // re-renders the page with the props that have been set in the page
        await rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Login setToken={setBrowserToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={browserToken}/>
        </Router>);

        await waitFor(() => {
            // checks the current page is the journeys page
            expect(routeHistory.location.pathname).toBe("/journeys");
        });

    });

    // check logging in as a manager takes you to the user-details page
    it("Manager login", async () => {
        let routeHistory = createMemoryHistory({initialEntries:['/login']},);
        const {container, rerender} = render(<Router location={routeHistory.location} navigator={routeHistory}>
            <Login setToken={setBrowserToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={browserToken}/>
        </Router>);

        axios.post = jest.fn().mockResolvedValue({ data: { access_token: 'fake_access_token' } });
        axios.get = jest.fn().mockResolvedValue({ data: { user_role: 'manager', subscribed: "true" }});

        const emailBox = container.querySelector('input[type="email"]');
        const passwordBox = container.querySelector('input[type="password"]');
        const loginButton = screen.getByRole('button', {name: /Log in/i})

        userEvent.type(emailBox, "manager@pinpoint.com");
        userEvent.type(passwordBox, 'manager123');

        userEvent.click(loginButton);

        // wait until the tokens have been set
        await waitFor(async () => {});

        // re-renders the page with the props that have been set in the page
        await rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Login setToken={setBrowserToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={browserToken}/>
        </Router>);

        await waitFor(() => {
            // checks the current page is the user details page
            expect(routeHistory.location.pathname).toBe("/user-details");
        });
    });


    // check logging in as a new user takes you to the new-sub page
    it("Unpaid customer login", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/login']},);
        const {container, rerender} = render(<Router location={routeHistory.location} navigator={routeHistory}>
            <Login setToken={setBrowserToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed}
                   isSubscribed={isSubscribed} token={browserToken}/>
        </Router>);

        axios.post = jest.fn().mockResolvedValue({data: {access_token: 'fake_access_token'}});
        axios.get = jest.fn().mockResolvedValue({data: {user_role: 'customer', subscribed: "false"}});

        const emailBox = container.querySelector('input[type="email"]');
        const passwordBox = container.querySelector('input[type="password"]');
        const loginButton = screen.getByRole('button', {name: /Log in/i})

        userEvent.type(emailBox, "newUser@pinpoint.com");
        userEvent.type(passwordBox, 'newUser');

        userEvent.click(loginButton);

        // wait until the tokens have been set
        await waitFor(async () => {
        });

        // re-renders the page with the props that have been set in the page
        await rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Login setToken={setBrowserToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed}
                   isSubscribed={isSubscribed} token={browserToken}/>
        </Router>);

        await waitFor(() => {
            // checks the current page is the new-sub page
            expect(routeHistory.location.pathname).toBe("/new-subscription");
        });
    });
});
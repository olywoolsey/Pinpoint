import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Router} from "react-router-dom";
import {expect} from '@jest/globals';
import Register from "../pages/Register";
import userEvent from "@testing-library/user-event";
import {createMemoryHistory} from 'history';
import axios from 'axios';

jest.mock("axios");

describe(Register, () => {
    let token;
    let setToken;
    let setRole;
    let setIsSubscribed;
    let role;
    let isSubscribed;

    // sets the browser token for each session
    beforeEach(() => {
        token = null;
        setToken = jest.fn((newToken) => {
            token = newToken
        });
        role = null;
        isSubscribed = null;
        setRole = jest.fn((newRole) => {role = newRole});
        setIsSubscribed = jest.fn((newSub) => {isSubscribed = newSub});

        axios.post = jest.fn().mockResolvedValue(
            { data: {
                    access_token: "test_access_token"
                }});
    });

    // makes sure the login form displays the email, password and login fields
    it("All key components render", () => {
        render(<MemoryRouter><Register/></MemoryRouter>);

        // get all the elements that should render on the page
        const title = screen.getByRole("heading", {name: "Create an account"});
        const yourEmailInput = screen.getByLabelText("Your email");
        const usernameInput = screen.getByLabelText("Username");
        const passwordInput = screen.getByLabelText("Password");
        const confPasswordInput = screen.getByLabelText("Confirm password");
        const createAccountButton = screen.getByRole("button", {name: "Create an account"});
        expect(title).toBeInTheDocument();
        expect(yourEmailInput).toBeInTheDocument();
        expect(usernameInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(confPasswordInput).toBeInTheDocument();
        expect(createAccountButton).toBeInTheDocument();
    });


    // test that setting up an account causes an axios request and redirects
    it("Registration form submission", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/register']});
        const {rerender} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Register setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {
            expect(routeHistory.location.pathname).toBe("/register");
        });

        // get all the elements in the register form
        const yourEmailInput = screen.getByLabelText("Your email");
        const usernameInput = screen.getByLabelText("Username");
        const passwordInput = screen.getByLabelText("Password");
        const confPasswordInput = screen.getByLabelText("Confirm password");
        const createAccountButton = screen.getByRole("button", {name: "Create an account"});

        // set the form values
        userEvent.type(yourEmailInput, "test@email.com");
        userEvent.type(usernameInput, "testUsername");
        userEvent.type(passwordInput, "testPassword");
        userEvent.type(confPasswordInput, "testPassword");

        // submit the form
        await userEvent.click(createAccountButton);

        // check registering is called with the correct options
        expect(axios.post).toHaveBeenCalledWith("/register", {"email": "test@email.com", "password": "testPassword", "username": "testUsername"});

        await waitFor(() => {
            // check an attempt has been made to update access token
            expect(setToken).toHaveBeenCalledWith("test_access_token" );
        });

        // this rerenders the page with the new token, as jest cannot automatically pass the updated token
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Register setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {
            // check the user has been redirected to the new-subscription page
            expect(routeHistory.location.pathname).toBe("/new-subscription");
        });
    });


    // test that if you already have a token and a subscription you will be redirected to the journeys page
    it("Logged in, with subscription", async () => {
        token = "test_token";
        isSubscribed = true;

        let routeHistory = createMemoryHistory({initialEntries: ['/register']});
        render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Register setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {
            expect(routeHistory.location.pathname).toBe("/journeys");
        });
    });


    // test that if you already have a token but no subscription you will be redirected to the new-sub page
    it("Logged in, without subscription", async () => {
        token = "test_token";
        isSubscribed = false;

        let routeHistory = createMemoryHistory({initialEntries: ['/register']});
        render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Register setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {
            expect(routeHistory.location.pathname).toBe("/new-subscription");
        });
    });


    // test that if user already exists do not direct
    it("Account already exists", async () => {
        // simulates the post response when an account with this name already exists
        axios.post = jest.fn().mockResolvedValue(
            { data: {
                    message: "User already exists"
                }});

        let routeHistory = createMemoryHistory({initialEntries: ['/register']});
        const {rerender} = render(<Router location={routeHistory.location} navigator={routeHistory}>
            <Register setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        // check it doesn't redirect at the start
        await waitFor(() => {
            expect(routeHistory.location.pathname).toBe("/register");
        });

        // get all the elements in the register form
        const yourEmailInput = screen.getByLabelText("Your email");
        const usernameInput = screen.getByLabelText("Username");
        const passwordInput = screen.getByLabelText("Password");
        const confPasswordInput = screen.getByLabelText("Confirm password");
        const createAccountButton = screen.getByRole("button", {name: "Create an account"});

        // set the form values
        userEvent.type(yourEmailInput, "test@email.com");
        userEvent.type(usernameInput, "testUsername");
        userEvent.type(passwordInput, "testPassword");
        userEvent.type(confPasswordInput, "testPassword");

        // submit the form
        await userEvent.click(createAccountButton);

        // check registering is called with the correct options
        expect(axios.post).toHaveBeenCalledWith("/register", {
            "email": "test@email.com",
            "password": "testPassword",
            "username": "testUsername"
        });

        // this rerenders the page to make sure the token is updated if needs be
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Register setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {
            // check the user has not been redirected
            expect(routeHistory.location.pathname).toBe("/register");
        });
    });
});

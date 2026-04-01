import Navbar from "../components/Navbar";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Router} from "react-router-dom";
import axios from 'axios';
import userEvent from "@testing-library/user-event";
import {createMemoryHistory} from "history";
import {expect} from "@jest/globals";
import {wait} from "@testing-library/user-event/dist/utils";


describe(Navbar, () => {
    let token;
    let setToken;
    let removeToken;
    let setRole;
    let setIsSubscribed;
    let role;
    let isSubscribed;

    // this will run before each of the tests
    beforeEach(() => {
        // mock this axios
        axios.get = jest.fn().mockResolvedValue(
            {
                data: {
                    user_role: "customer",
                    access_token: "test_token",
                    subscribed: "true",
                }
            });
        axios.post = jest.fn().mockResolvedValue({data: {}});

        // this tracks any alerts that take place
        window.alert = jest.fn();

        // tokens to be passed as props if they are needed in the specific test
        token = null;
        setToken = jest.fn((newTokenValue) => {
            token = newTokenValue
        });
        removeToken = jest.fn(() => {
            token = null;
        });
        role = null;
        isSubscribed = null;
        setRole = jest.fn((newRole) => {role = newRole});
        setIsSubscribed = jest.fn((newSub) => {isSubscribed = newSub});
    });


    // Only the pages that are visitable to a logged-out user show
    it("All key logged-out components render", () => {
        render(<MemoryRouter><Navbar token={token} removeToken={removeToken} setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed}/></MemoryRouter>);

        // check these buttons are in the navbar
        const logoButton = screen.getAllByAltText("PinPoint Logo");
        const loginButton = screen.getAllByText("Login");
        const registerButton = screen.getAllByText("Register");
        expect(logoButton[0]).toBeInTheDocument();
        expect(loginButton[0]).toBeInTheDocument();
        expect(registerButton[0]).toBeInTheDocument();

        // check these buttons are not in the navbar
        const journeysButton = screen.queryByText("Journeys");
        const accountButton = screen.queryByText("Account");
        const friendsButton = screen.queryByText("Friends");
        const logoutButton = screen.queryByText("Logout");
        expect(journeysButton).toBeNull();
        expect(accountButton).toBeNull();
        expect(friendsButton).toBeNull();
        expect(logoutButton).toBeNull();

        // check these manager buttons are not in the navbar
        const userDetailsButton = screen.queryByText("User Details");
        const revenueButton = screen.queryByText("Revenue Projections");
        expect(userDetailsButton).toBeNull();
        expect(revenueButton).toBeNull();
    });


    it("Logged in customer Navbar display", async () => {
        token = "test_token";

        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/navbar']});
        const {rerender} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {});

        expect(axios.get).toHaveBeenCalledWith("/check_user_role", {"headers": {"Authorization": "Bearer test_token"}});
        expect(axios.get).toHaveBeenCalledWith("/check_user_sub_status", {"headers": {"Authorization": "Bearer test_token"}});

        // rerender with the updated tokens
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        // the customer navbar has now been displayed
        await waitFor(() => {
            // check the logo button is in the navbar
            const logoButton = screen.getAllByAltText("PinPoint Logo");
            expect(logoButton[0]).toBeInTheDocument();

            // check these buttons are in the navbar
            const journeysButton = screen.getAllByText("Journeys");
            const accountButton = screen.getAllByText("Account");
            const friendsButton = screen.getAllByText("Friends");
            const logoutButton = screen.getAllByText("Logout");
            expect(journeysButton[0]).toBeInTheDocument();
            expect(accountButton[0]).toBeInTheDocument();
            expect(friendsButton[0]).toBeInTheDocument();
            expect(logoutButton[0]).toBeInTheDocument();

            const loginButton = screen.queryByText("Login");
            const registerButton = screen.queryByText("Register");
            expect(loginButton).toBeNull();
            expect(registerButton).toBeNull();

            // check these manager buttons are not in the navbar
            const userDetailsButton = screen.queryByText("User Details");
            const revenueButton = screen.queryByText("Revenue Projections");
            expect(userDetailsButton).toBeNull();
            expect(revenueButton).toBeNull();
        });
    });


    // logged in as a manager navbar check
    it("All key user logged-in components render", async () => {
        token = "test_token";
        axios.get = jest.fn().mockResolvedValue(
            {
                data: {
                    user_role: "manager",
                    access_token: "test_token",
                    subscribed: "true",
                }
            });

        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/navbar']});
        const {rerender} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {});

        expect(axios.get).toHaveBeenCalledWith("/check_user_role", {"headers": {"Authorization": "Bearer test_token"}});
        expect(axios.get).toHaveBeenCalledWith("/check_user_sub_status", {"headers": {"Authorization": "Bearer test_token"}});

        // rerender with the updated tokens
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        // the manager navbar has now been displayed
        await waitFor(() => {
            // check the logo button is in the navbar
            const logoButton = screen.getAllByAltText("PinPoint Logo");
            expect(logoButton[0]).toBeInTheDocument();

            // check these buttons are not in the navbar
            const journeysButton = screen.queryByText("Journeys");
            const accountButton = screen.queryByText("Account");
            const friendsButton = screen.queryByText("Friends");
            expect(journeysButton).toBeNull();
            expect(accountButton).toBeNull();
            expect(friendsButton).toBeNull();

            // check the logged out buttons aren't in the navbar
            const loginButton = screen.queryByText("Login");
            const registerButton = screen.queryByText("Register");
            expect(loginButton).toBeNull();
            expect(registerButton).toBeNull();

            // check these manager buttons are not in the navbar
            const userDetailsButton = screen.queryAllByText("User Details");
            const revenueButton = screen.queryAllByText("Revenue Projections");
            const logoutButton = screen.queryAllByText("Logout");
            expect(userDetailsButton[0]).toBeInTheDocument();
            expect(revenueButton[0]).toBeInTheDocument();
            expect(logoutButton[0]).toBeInTheDocument();
        });
    });


    // check the login button redirects the user to the login page
    it("Login button", async () => {
        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/']});
        const {rerender} = render(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed}
                    isSubscribed={isSubscribed} token={token}/>
        </Router>);

        let loginButton;

        await waitFor(() => {loginButton = screen.getAllByText("Login");});

        userEvent.click(loginButton[0]);

        await waitFor(() => {
            expect(routeHistory.location.pathname).toBe("/login");
        });
    });

    // check the register button redirects the user to the register page
    it("Register button", async () => {
        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/']});
        const {rerender} = render(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed}
                    isSubscribed={isSubscribed} token={token}/>
        </Router>);

        let registerButton;

        await waitFor(() => {registerButton = screen.getAllByText("Register");});

        userEvent.click(registerButton[0]);

        await waitFor(() => {
            expect(routeHistory.location.pathname).toBe("/register");
        });
    });


    //Home button redirects to the home page
    it("Home button", async () => {
        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/navbar']});
        const {rerender} = render(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed}
                    isSubscribed={isSubscribed} token={token}/>
        </Router>);

        let logoButton;

        await waitFor(() => {logoButton = screen.getAllByAltText("PinPoint Logo");});

        userEvent.click(logoButton[0]);

        await waitFor(() => {
            expect(routeHistory.location.pathname).toBe("/");
        });
    });


    // logged in as a manager navbar check
    it("All key manager components render", async () => {
        token = "test_token";
        axios.get = jest.fn().mockResolvedValue(
            {
                data: {
                    user_role: "manager",
                    access_token: "test_token",
                    subscribed: "true",
                }
            });

        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/navbar']});
        const {rerender} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {});

        // rerender with the updated tokens
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        let userDetailsButton;

        // the manager navbar has now been displayed
        await waitFor(() => {
            userDetailsButton = screen.queryAllByText("User Details");
            userEvent.click(userDetailsButton[0]);
        });

        expect(routeHistory.location.pathname).toBe("/user-details");
    });


    // revenue button redirects as intended
    it("Revenue button", async () => {
        token = "test_token";
        axios.get = jest.fn().mockResolvedValue(
            {data: {user_role: "manager", access_token: "test_token", subscribed: "true",}});

        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/navbar']});
        const {rerender} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {});

        // rerender with the updated tokens
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        let revenueButton;

        // the manager navbar has now been displayed
        await waitFor(() => {
            revenueButton = screen.queryAllByText("Revenue Projections");
            userEvent.click(revenueButton[0]);
        });

        expect(routeHistory.location.pathname).toBe("/projections");
    });

    // journeys button redirects to journeys page
    it("Journeys button", async () => {
        token = "test_token";

        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/navbar']});
        const {rerender} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {});

        // rerender with the updated tokens
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        let journeysButton;

        // the customer navbar has now been displayed
        await waitFor(() => {
            // check these buttons are in the navbar
            journeysButton = screen.getAllByText("Journeys");
            userEvent.click(journeysButton[0]);
        });

        expect(routeHistory.location.pathname).toBe("/journeys");
    });


    // account button redirects to account page
    it("Account button", async () => {
        token = "test_token";

        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/navbar']});
        const {rerender} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {});

        // rerender with the updated tokens
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        let accountButton;

        // the customer navbar has now been displayed
        await waitFor(() => {
            // check these buttons are in the navbar
            accountButton = screen.getAllByText("Account");
            userEvent.click(accountButton[0]);
        });

        expect(routeHistory.location.pathname).toBe("/account");
    });


    // friends button redirects to friends page
    it("Friends button", async () => {
        token = "test_token";

        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/navbar']});
        const {rerender} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {});

        // rerender with the updated tokens
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        let friendsButton;

        // the customer navbar has now been displayed
        await waitFor(() => {
            // check these buttons are in the navbar
            friendsButton = screen.getAllByText("Friends");
            userEvent.click(friendsButton[0]);
        });

        expect(routeHistory.location.pathname).toBe("/friends");
    });

    // logout button redirects to home page
    it("Logout button", async () => {
        token = "test_token";

        // this route doesn't exist but has to have a route that doesn't exist, so updating navbar functions are called
        let routeHistory = createMemoryHistory({initialEntries: ['/navbar']});
        const {rerender} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {});

        // rerender with the updated tokens
        rerender(<Router location={routeHistory.location} navigator={routeHistory}>
            <Navbar removeToken={removeToken} setToken={setToken} role={role} setRole={setRole} setIsSubscribed={setIsSubscribed} isSubscribed={isSubscribed} token={token}/>
        </Router>);

        let logoutButton;

        // the customer navbar has now been displayed
        await waitFor(() => {
            // check these buttons are in the navbar
            logoutButton = screen.getAllByText("Logout");
            userEvent.click(logoutButton[0]);
        });

        // check that the user has been sent back the home directory and the token has been set to NULL
        expect(routeHistory.location.pathname).toBe("/");
        expect(token).toBeNull();
    });
});
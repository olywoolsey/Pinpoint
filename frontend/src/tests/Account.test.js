import Account from "../pages/Account";
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Router} from "react-router-dom";
import axios from 'axios';
import userEvent from "@testing-library/user-event";
import {createMemoryHistory} from "history";

jest.mock("axios");
describe(Account, () => {
    let token;
    let setToken;
    let isSubscribed;
    let setIsSubscribed;

    // this will run before each of the tests
    beforeEach(() => {
        // mock this axios
        axios.get = jest.fn().mockResolvedValue(
            { data: {
                    name: "test account",
                    subscription: {status: "active", plan: {currency: "gbp", amount: 200}, current_period_end: 1712065272},
                    subscribed: true,
                }});
        axios.post = jest.fn().mockResolvedValue({data: {}});

        // tokens to be passed as props if they are needed in the specific test
        token = "test_token";
        setToken = jest.fn((newTokenValue) => {token = newTokenValue});
        isSubscribed = true;
        setIsSubscribed = jest.fn((newSubValue) => {isSubscribed = newSubValue});
    });

    // check all of the buttons are on the page correctly
    //  if this fails it can cause other test failures even if the functionality is there, test updates will need to be done
    it("All key components render", async () => {
        render(<MemoryRouter><Account isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} token={token} setToken={setToken}/></MemoryRouter>);

        // check the change username and password buttons are in the document
        const changeUsernameButton = screen.getByText("Change Username");
        const changePasswordButton = screen.getByText("Change Password");
        expect(changeUsernameButton).toBeInTheDocument();
        expect(changePasswordButton).toBeInTheDocument();

        // check the delete account button is in the document
        const deleteAccountButton = screen.getByRole("button", {name: "Delete Account"});
        expect(deleteAccountButton).toBeInTheDocument();

        // tests that need to be carried out after the get request has been made
        await waitFor(() => {
            // check the username is displayed at the top of the page
            const usernameText = screen.getByText("Welcome test account!");
            expect(usernameText).toBeInTheDocument();

            // check the payment information appears correctly
            const paymentStatus = screen.getByText("Status: active");
            const paymentPricing = screen.getByText("Price: 2 GBP");
            // const paymentNextDate = screen.getByText("Next Payment Date: 02/04/2024");
            expect(paymentStatus).toBeInTheDocument();
            expect(paymentPricing).toBeInTheDocument();
            // expect(paymentNextDate).toBeInTheDocument();

            // now the get request has been processed buy subscription button should be replaced
            // with cancel and change subscription buttons
            const changeSubButton = screen.getByRole("button", {name: "Change Subscription"});
            const cancelSubButton = screen.getByRole("button", {name: "Cancel Subscription"});
            expect(changeSubButton).toBeInTheDocument();
            expect(cancelSubButton).toBeInTheDocument();
        });
    });

    // check the change username form submits the correct information via axios.post to the backend works
    it("Change username form", async () => {
        render(<MemoryRouter><Account isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} token={token} setToken={setToken}/></MemoryRouter>);

        let changeUsernameButton = screen.getByRole("button", {name: "Change Username"});

        // check that the change username fields are not visible before clicking the button
        await waitFor(() => {
            const newUsernameInput = screen.queryByLabelText("New username");
            const saveUsernameButton = screen.queryByText("Save Username");
            expect(newUsernameInput).toBeNull();
            expect(saveUsernameButton).toBeNull();
        });

        userEvent.click(changeUsernameButton);

        // make sure the initial get requests have been made before attempting to change username
        await waitFor(async () => {
            // check the input box to change username has been rendered
            const newUsernameInput = screen.getByLabelText("New username");
            const saveUsernameButton = screen.getByText("Save Username");
            expect(newUsernameInput).toBeInTheDocument();
            expect(saveUsernameButton).toBeInTheDocument();

            userEvent.type(newUsernameInput, "new test username");
            userEvent.click(saveUsernameButton);

            // check that filling out the form causes the new username data to be sent to the backend
            expect(axios.post).toHaveBeenCalledWith("/change_username",
                {"new_username": "new test username"},
                {"headers": {"Authorization": "Bearer test_token"}});
        });
        // could test here if the page reloads with the new username here but this is not implemented on the site yet
    });

    // check the change password form works and causes an axios request, with intended data
    it("Change password form", async () => {
        render(<MemoryRouter><Account isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} token={token} setToken={setToken}/></MemoryRouter>);

        let changePasswordButton = screen.getByRole("button", {name: "Change Password"});

        // check that the change username fields are not visible before clicking the button
        await waitFor(() => {
            const currentPass = screen.queryByLabelText("Current password");
            const newPass = screen.queryByLabelText("New password");
            const newPassConfirm = screen.queryByLabelText("Confirm new password:");
            const savePasswordButton = screen.queryByText("Save New Password");
            expect(currentPass).toBeNull();
            expect(newPass).toBeNull();
            expect(newPassConfirm).toBeNull();
            expect(savePasswordButton).toBeNull();
        });

        userEvent.click(changePasswordButton);

        // make sure the initial get requests have been made before attempting to change username
        await waitFor(async () => {
            // check the form to change password has been rendered
            const currentPass = screen.getByLabelText("Current password");
            const newPass = screen.getByLabelText("New password");
            const newPassConfirm = screen.getByLabelText("Confirm new password");
            const savePasswordButton = screen.getByText("Save New Password");
            expect(currentPass).toBeInTheDocument();
            expect(newPass).toBeInTheDocument();
            expect(newPassConfirm).toBeInTheDocument();
            expect(savePasswordButton).toBeInTheDocument();

            userEvent.type(currentPass, "currentPass");
            userEvent.type(newPass, "newPassword");
            userEvent.type(newPassConfirm, "newPassword");
            userEvent.click(savePasswordButton);

            // check that filling out the form causes the new password data to be sent to the backend and only called once
            expect(axios.post).toHaveBeenCalledWith("/change_password", { "current_password": "currentPass", "new_password": "newPassword"}, {"headers": {"Authorization": "Bearer test_token"}});
            expect(axios.post).toHaveBeenCalledTimes(1);
        });
        // could test here if the page reloads with the new username here but this is not implemented on the site yet
    });

    // check that the change subscription button redirects as intended
    it("Change subscription button", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/account']},);
        const {container} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Account setToken={setToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} token={token}/>
        </Router>);

        await waitFor(() => {
            // find and click the change subscription button
            const changeSubscriptionButton = screen.getByRole("button", {name: "Change Subscription"});
            userEvent.click(changeSubscriptionButton);

            // check that this has caused a redirect to the payments page
            expect(routeHistory.location.pathname).toBe("/change-subscription");
        });
    });

    // check that the change subscription button works as intended, by sending an axios request
    it("Cancel subscription button", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/account']},);
        const {container} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Account setToken={setToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} token={token} removeToken={jest.fn()}/>
        </Router>);

        let cancelSubButton

        await waitFor(async () => {
            // mock window confirm so when clicking on cancel subscription button,
            // it simulates clicking "no" in the popup confirmation window
            window.confirm = jest.fn(() => false);

            // find and click the change subscription button
            cancelSubButton = screen.getByRole("button", {name: "Cancel Subscription"});
            userEvent.click(cancelSubButton);

            // check no post request has been sent to the backend (the cancel didn't go through)
            expect(axios.post).toHaveBeenCalledTimes(0);
        });

        await waitFor(() => {
            // simulate clicking "yes" in the popup confirmation window and click sub button again
            window.confirm = jest.fn(() => true);
            userEvent.click(cancelSubButton);

            // check a delete request has been sent to the backend and redirected to the payments page
            expect(axios.post).toHaveBeenCalledWith("/delete_subscription", {}, {"headers": {"Authorization": "Bearer test_token"}});
            expect(routeHistory.location.pathname).toBe("/new-subscription");
        });
    });

    // check that the delete account button works as intended, by sending an axios request
    it("Delete account button", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/account']},);
        const {container} = render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Account setToken={setToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} token={token} removeToken={jest.fn()}/>
        </Router>);

        let deleteAccountButton

        await waitFor(async () => {
            // mock window confirm so when clicking on delete account button,
            // it simulates clicking "no" in the popup confirmation window
            window.confirm = jest.fn(() => false);

            // find and click the change subscription button
            deleteAccountButton = screen.getByRole("button", {name: "Delete Account"});
            userEvent.click(deleteAccountButton);

            // check no post request has been sent to the backend (the cancel didn't go through)
            expect(axios.post).toHaveBeenCalledTimes(0);
        });

        await waitFor(() => {
            // simulate clicking "yes" in the popup confirmation window and click sub button again
            window.confirm = jest.fn(() => true);
            userEvent.click(deleteAccountButton);

            // check a delete request has been sent to the backend and redirected to the payments page
            expect(axios.post).toHaveBeenCalledWith("/delete_account", {}, {"headers": {"Authorization": "Bearer test_token"}});
            expect(routeHistory.location.pathname).toBe("/");
        });
    });

    // check if a user is not subscribed they have the option to do so and sends them to the relevant page
    it("Buy subscription button", async () => {
        isSubscribed = false;

        let routeHistory = createMemoryHistory({initialEntries: ['/account']},);
        const {container} = render(<Router location={routeHistory.location} navigator={routeHistory}>
            <Account setToken={setToken} isSubscribed={isSubscribed} setIsSubscribed={setIsSubscribed} token={token} removeToken={jest.fn()}/>
        </Router>);

        // check the buy subscription button is in the document
        let buySubscriptionButton = screen.getByRole("button", {name: "Buy Subscription"});
        expect(buySubscriptionButton).toBeInTheDocument();

        userEvent.click(buySubscriptionButton);

        await waitFor(() => {
            expect(routeHistory.location.pathname).toBe("/new-subscription");
        });
    });
});
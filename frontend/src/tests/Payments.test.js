import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Router} from "react-router-dom";
import {expect} from '@jest/globals';
import Payments from "../pages/Payments";
import userEvent from "@testing-library/user-event";
import {createMemoryHistory} from 'history';
import axios from 'axios';
import {loadStripe, Stripe} from '@stripe/stripe-js';

// Mock the entire @stripe/stripe-js module
jest.mock('@stripe/stripe-js', () => {
    return {
        loadStripe: jest.fn().mockResolvedValue({
            redirectToCheckout: jest.fn().mockResolvedValue({}),
        }),
    };
});

jest.mock("axios");

const stripePromise = loadStripe('pk_test_51Omg9mC2Liz4wwk2KbYDgpL2uqucPHXKp1O6mkHFT4XccD4wssTe9BrLb2NH2nJJM2Jk9PK11xwLdUZTW44l6PDN00VzP4uOe7');

describe(Payments, () => {
    let token;
    let setToken;

    // sets the browser token for each session
    beforeEach(() => {
        token = "test_token";
        setToken = jest.fn((newToken) => {
            token = newToken
        });

        axios.post = jest.fn().mockResolvedValue(
            {
                data: {
                    session_id: "cs_test_a1pij0Fg43uKy4rHxI661ubR8yBZoXYIMrLG0uNc2d6TiYhEOkIlEVxfVH"
                }
            });
    });


    // makes sure the payments page displays correctly
    it("All key components render", () => {
        render(<MemoryRouter><Payments/></MemoryRouter>);

        // check all of the key elements are present
        const title = screen.getByText("Subscriptions");
        const weekly = screen.getByText("Weekly");
        const weeklySubButton = screen.getByText("Subscribe for a Week");
        const monthly = screen.getByText("Monthly");
        const monthlySubButton = screen.getByText("Subscribe for a Month");
        const annually = screen.getByText("Annually");
        const annualSubButton = screen.getByText("Subscribe for a Year");

        expect(title).toBeInTheDocument();
        expect(weekly).toBeInTheDocument();
        expect(weeklySubButton).toBeInTheDocument();
        expect(monthly).toBeInTheDocument();
        expect(monthlySubButton).toBeInTheDocument();
        expect(annually).toBeInTheDocument();
        expect(annualSubButton).toBeInTheDocument();
    });


    // make correct axios request made and information sent to stripe
    it("Subscribing weekly", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/payments']});
        render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Payments setToken={setToken} token={token}/>
        </Router>);

        const weeklySubButton = screen.getByText("Subscribe for a Week");
        await userEvent.click(weeklySubButton);

        // check that the post request has been sent to the backend
        await expect(axios.post).toHaveBeenCalledWith("/create_checkout_session", {"subscription_type": "weekly"}, {"headers": {"Authorization": "Bearer test_token"}});

        // check that stripe has been called with the correct information
        const stripe = await loadStripe('');
        await waitFor(() => {
            expect(stripe.redirectToCheckout).toHaveBeenCalledWith({"sessionId": "cs_test_a1pij0Fg43uKy4rHxI661ubR8yBZoXYIMrLG0uNc2d6TiYhEOkIlEVxfVH"})
        });
    });

    // make correct axios request made and information sent to stripe
    it("Subscribing monthly", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/payments']});
        render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Payments setToken={setToken} token={token}/>
        </Router>);

        const monthlySubButton = screen.getByText("Subscribe for a Month");
        await userEvent.click(monthlySubButton);

        // check that the post request has been sent to the backend
        await expect(axios.post).toHaveBeenCalledWith("/create_checkout_session", {"subscription_type": "monthly"}, {"headers": {"Authorization": "Bearer test_token"}});

        // check that stripe has been called with the correct information
        const stripe = await loadStripe('');
        await waitFor(() => {
            expect(stripe.redirectToCheckout).toHaveBeenCalledWith({"sessionId": "cs_test_a1pij0Fg43uKy4rHxI661ubR8yBZoXYIMrLG0uNc2d6TiYhEOkIlEVxfVH"})
        });
    });

    // make correct axios request made and information sent to stripe
    it("Subscribing yearly", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/payments']});
        render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Payments setToken={setToken} token={token}/>
        </Router>);

        const yearlySubButton = screen.getByText("Subscribe for a Year");
        await userEvent.click(yearlySubButton);

        // check that the post request has been sent to the backend
        await expect(axios.post).toHaveBeenCalledWith("/create_checkout_session", {"subscription_type": "annually"}, {"headers": {"Authorization": "Bearer test_token"}});

        // check that stripe has been called with the correct information
        const stripe = await loadStripe('');
        await waitFor(() => {
            expect(stripe.redirectToCheckout).toHaveBeenCalledWith({"sessionId": "cs_test_a1pij0Fg43uKy4rHxI661ubR8yBZoXYIMrLG0uNc2d6TiYhEOkIlEVxfVH"})
        });
    });
});
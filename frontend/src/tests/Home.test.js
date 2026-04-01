import Home from "../pages/Home";
import {render, screen} from "@testing-library/react";
import {MemoryRouter, Router} from "react-router-dom";
import axios from 'axios';
import userEvent from "@testing-library/user-event";
import {createMemoryHistory} from "history";
import { Polyline } from 'react-leaflet';
import {expect} from "@jest/globals";


// jest cannot understand SVG's so it has to mock polyline
jest.mock('react-leaflet', () => {
    const actualReactLeaflet = jest.requireActual('react-leaflet');
    return {
        ...actualReactLeaflet,
        //Polyline: jest.fn(({ onClick }) => <div data-testid="mock-polyline" onClick={onClick}></div>),
        Polyline: jest.fn(({ eventHandlers, ...props }) => (
            <div data-testid="mock-polyline" onClick={eventHandlers?.click} {...props}></div>
        )),
    };
});

describe(Home, () => {
    let token;
    let setToken;

    // this will run before each of the tests
    beforeEach(() => {
        // mock this axios
        axios.get = jest.fn().mockResolvedValue(
            {
                data: {
                    current_friends: [[2, "friend 2"], [45, "friend 45"]],
                    incoming_friends: [[56, "friend 56"]],
                    outgoing_friends: [[1, "friend 1"]],
                }
            });
        axios.post = jest.fn().mockResolvedValue({data: {}});

        // this tracks any alerts that take place
        window.alert = jest.fn();

        // tokens to be passed as props if they are needed in the specific test
        token = "test_token";
        setToken = jest.fn((newTokenValue) => {
            token = newTokenValue
        });
    });


    // test the home page components load correctly
    it("All key components render", () => {
        render(<MemoryRouter><Home token={token} setToken={setToken}/></MemoryRouter>);

        // check that the "our features" section renders properly
        const ourFeatures = screen.getByText("Our Features");
        const plotRoutes = screen.getByText("Plot Routes");
        const addFriends = screen.getByText("Add Friends");
        const changeMaps = screen.getByText("Change Maps");
        expect(ourFeatures).toBeInTheDocument();
        expect(plotRoutes).toBeInTheDocument();
        expect(addFriends).toBeInTheDocument();
        expect(changeMaps).toBeInTheDocument();

        // check the "have a go" section renders properly
        const haveAGo = screen.getByText("Have a go!");
        const leafletMap = screen.getByText("Leaflet");
        expect(haveAGo).toBeInTheDocument();
        expect(leafletMap).toBeInTheDocument();

        // check the "subscriptions section has rendered correctly
        const subscriptions = screen.getByText("Subscriptions");
        const weekly = screen.getByText("Weekly");
        const monthly = screen.getByText("Monthly");
        const annually = screen.getByText("Annually");
        const signUpNow = screen.getAllByText("Sign Up Now!");
        expect(subscriptions).toBeInTheDocument();
        expect(weekly).toBeInTheDocument();
        expect(monthly).toBeInTheDocument();
        expect(annually).toBeInTheDocument();
        expect(signUpNow.length).toBe(3);
    });


    // test clicking on sign up button at the top takes you to the register page
    it("Sign up button", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/']});
        render( <Router location={routeHistory.location} navigator={routeHistory}>
            <Home setToken={setToken} token={token}/>
        </Router>);

        const signUpButton = screen.getByText("Sign Up");
        await userEvent.click(signUpButton);

        // check that you are now on the register page
        expect(routeHistory.location.pathname).toBe("/register");
    });


    // test the sign up now buttons at the bottom of the page work
    it("Sign up now button", async () => {
        let routeHistory = createMemoryHistory({initialEntries: ['/']});
        render(<Router location={routeHistory.location} navigator={routeHistory}>
            <Home setToken={setToken} token={token}/>
        </Router>);

        const signUpButton = screen.getAllByText("Sign Up Now!");
        await userEvent.click(signUpButton[0]);

        // check that you are now on the register page
        expect(routeHistory.location.pathname).toBe("/register");
    });
});
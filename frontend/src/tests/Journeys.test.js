import Journeys from '../pages/Journeys';
import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Router} from "react-router-dom";
import {expect} from '@jest/globals';
import axios from "axios";
import userEvent from "@testing-library/user-event";
import { Polyline } from 'react-leaflet';

jest.mock("axios");

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

describe(Journeys, () => {
    let token;
    let setToken;

    // before every test return the get request of all the routes
    beforeEach(() => {
        // first request gives a single route, with no friends
        axios.get = jest.fn().mockResolvedValue(
            { data: {
                    route_list: [[0, 2, "test route"]],
                    current_friends: [],
                    coordinates: [[53.808346, -1.561104], [53.808331, -1.561051], [53.80851, -1.5609], [53.808607, -1.561162]],
                    route_name: "test route"
                }});
        axios.post = jest.fn().mockResolvedValue({data: {}});

        // tokens to be passed as props if they are needed in the specific test
        token = "test_token";
        setToken = jest.fn((newTokenValue) => {token = newTokenValue});
    });

    // check that journeys page has been loaded correctly
    it("All key components render", () => {
        const {container} = render(<MemoryRouter><Journeys /></MemoryRouter>);

        // check the regular map option exists
        const regularMap = screen.getByLabelText("Regular");
        expect(regularMap).toBeInTheDocument();
        expect(regularMap).toHaveAttribute("type", "radio");

        // check satellite map option exists
        const satelliteMap = screen.getByLabelText("Satellite");
        expect(satelliteMap).toBeInTheDocument();
        expect(satelliteMap).toHaveAttribute("type", "radio");

        // check the upload button is there
        const uploadRoute = screen.getByText("Upload Route");
        expect(uploadRoute).toBeInTheDocument();

        // check the map is on the screen
        const leafletMap = screen.getByText("Leaflet");
        expect(leafletMap).toBeInTheDocument();
    });

    // check clicking upload brings up the upload popup and clicking close closes it
    it("Toggle upload form button", async () => {
        const {container} = render(<MemoryRouter><Journeys/></MemoryRouter>);

        // get the upload route button
        const uploadRoute = screen.getByText("Upload Route");

        // get the upload form background
        const uploadForm = container.querySelector('div.grey-background');

        // get the exit button for the uploadForm
        const exitForm = screen.getByText("X");

        expect(uploadRoute).toBeInTheDocument();
        expect(uploadForm).toBeInTheDocument();
        expect(exitForm).toBeInTheDocument();

        let uploadZIndex = window.getComputedStyle(uploadForm).getPropertyValue("z-index");

        // check the starting value of the z index is -1
        expect(uploadZIndex).toBe("-1");

        userEvent.click(uploadRoute);

        // check when the button is clicked for the first time the upload route pops up
        await waitFor(() => {
            // check that the form starts with a height of -1
            uploadZIndex = window.getComputedStyle(uploadForm).getPropertyValue("z-index");
            expect(uploadZIndex).toBe("1005");
        });

        userEvent.click(uploadRoute);

        // check this disappears after the X button is clicked
        await waitFor(() => {
            uploadZIndex = window.getComputedStyle(uploadForm).getPropertyValue("z-index");
            expect(uploadZIndex).toBe("-1");
        });
    });

    // check that toggling the sidebar works
    it("Toggle sidebar button", async () => {
        const {container} = render(<MemoryRouter><Journeys/></MemoryRouter>);

        // get the upload route button
        const toggleButton = container.querySelector('.side-panel-toggle');

        // get the upload form background
        const sidePanel = container.querySelector('.side-panel-container');

        expect(toggleButton).toBeInTheDocument();
        expect(sidePanel).toBeInTheDocument();

        let sidePanelWidth = window.getComputedStyle(sidePanel).getPropertyValue("width");

        // check the starting value of the side panel is 20vw
        expect(sidePanelWidth).toBe("300px");

        userEvent.click(toggleButton);

        // check when the button is clicked for the first time the side panel disappears
        await waitFor(() => {
            // check that the form starts with a height of -1
            sidePanelWidth = window.getComputedStyle(sidePanel).getPropertyValue("width");
            expect(sidePanelWidth).toBe("0px");
        });

        userEvent.click(toggleButton);

        // check the side panel returns to its original size after the toggle is pressed again
        await waitFor(() => {
            sidePanelWidth = window.getComputedStyle(sidePanel).getPropertyValue("width");
            expect(sidePanelWidth).toBe("300px");
        });
    });

    // Checks changing the maps takes effect on the screen
    it("Change map style", async () => {
        const {container} = render(<MemoryRouter><Journeys/></MemoryRouter>);

        const regularMap = screen.getByLabelText("Regular");
        const satelliteMap = screen.getByLabelText("Satellite");

        // check that the starting map is loaded correctly
        let tileLayerURL = container.querySelector('img.leaflet-tile').getAttribute("src");
        let correctURL = tileLayerURL.includes("https://tile.jawg.io/jawg-streets/");
        expect(correctURL).toBe(true);

        userEvent.click(satelliteMap);
        tileLayerURL = container.querySelector('img.leaflet-tile').getAttribute("src");

        // checks clicking on the satellite button selects the correct map
        await waitFor(() => {
            correctURL = tileLayerURL.includes("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/");
            expect(correctURL).toBe(true);
        });

        userEvent.click(regularMap);
        tileLayerURL = container.querySelector('img.leaflet-tile').getAttribute("src");

        // check clicking the regular map button, changes the map type
        await waitFor(() => {
            correctURL = tileLayerURL.includes("https://tile.jawg.io/jawg-streets/");
            expect(correctURL).toBe(true);
        });
    });

    // check that the axios calls to get friends and routes are made when the program starts
    it("Get calls at runtime", async () => {
        const {container} = render(<MemoryRouter><Journeys token={token} setToken={setToken} /></MemoryRouter>);

        await waitFor(() => {
            // checks both get requests have been made and with the intended data
            expect(axios.get).toHaveBeenNthCalledWith(1, "/get_friends", {"headers": {"Authorization": "Bearer test_token"}});
            expect(axios.get).toHaveBeenNthCalledWith(2, "/get_route_list", {"headers": {"Authorization": "Bearer test_token"}});
        });
    });

    // clicking on a route name in the sidebar displays it on the map
    it("Displaying routes", async () => {
        const {container} = render(<MemoryRouter><Journeys token={token} setToken={setToken}/></MemoryRouter>);

        let testRouteButton;

        // wait for both of the axios get calls are made and get the "test route" button
        await waitFor(() => {
            testRouteButton = screen.getByLabelText("test route");

            expect(testRouteButton).toBeInTheDocument();
        });

        userEvent.click(testRouteButton);

        let mockPolyline;

        await waitFor(() => {
            expect(testRouteButton).toBeChecked();

            // check the get route function has been called, with the correct information
            expect(axios.get).toHaveBeenNthCalledWith(4, "/get_route", {"headers": {"Authorization": "Bearer test_token"}, "params": {"route_id": 2, "route_user_id": 0}});

            // check the Polyline route has been created, with the intended positions
            expect(Polyline).toHaveBeenCalledWith({"pathOptions": {"color": "#35CBF4", "fillColor": "red"}, "positions": [[53.808346, -1.561104], [53.808331, -1.561051], [53.80851, -1.5609], [53.808607, -1.561162]]}, {});

            // get the clickable polyline
            mockPolyline = screen.getAllByTestId("mock-polyline")[1];
            expect(mockPolyline).toBeInTheDocument();
        });
    });

    // delete route works as intended, and sends the correct axios request
    it("Delete route button", async () => {
        const {container} = render(<MemoryRouter><Journeys token={token} setToken={setToken}/></MemoryRouter>);

        let testRouteButton;

        // wait for both of the axios get calls are made and get the "test route" button
        await waitFor(() => {
            testRouteButton = screen.getByLabelText("test route");

            expect(testRouteButton).toBeInTheDocument();
        });

        userEvent.click(testRouteButton);

        let mockPolyline;

        await waitFor(() => {
            expect(testRouteButton).toBeChecked();

            // check the get route function has been called, with the correct information
            expect(axios.get).toHaveBeenNthCalledWith(4, "/get_route", {"headers": {"Authorization": "Bearer test_token"}, "params": {"route_id": 2, "route_user_id": 0}});

            // check the Polyline route has been created, with the intended positions
            expect(Polyline).toHaveBeenCalledWith({"pathOptions": {"color": "#35CBF4", "fillColor": "red"}, "positions": [[53.808346, -1.561104], [53.808331, -1.561051], [53.80851, -1.5609], [53.808607, -1.561162]]}, {});

            // get the clickable polyline
            mockPolyline = screen.getAllByTestId("mock-polyline")[1];
            expect(mockPolyline).toBeInTheDocument();
        });

        userEvent.click(mockPolyline);

        let deleteButton;

        await waitFor(() => {
            // check that the delete button has appeared
            deleteButton = screen.getByText("Delete");
            expect(deleteButton).toBeInTheDocument();

            userEvent.click(deleteButton);
            expect(axios.post).toHaveBeenCalledWith("/delete_route", {"route_id": 2}, {"headers": {"Authorization": "Bearer test_token"}} );
        });
    });

    // Download route works as intended
    it("Download route button", async () => {
        const {container} = render(<MemoryRouter><Journeys token={token} setToken={setToken}/></MemoryRouter>);

        let testRouteButton;

        // wait for both of the axios get calls are made and get the "test route" button
        await waitFor(() => {
            testRouteButton = screen.getByLabelText("test route");

            expect(testRouteButton).toBeInTheDocument();
        });

        userEvent.click(testRouteButton);

        let mockPolyline;

        await waitFor(() => {
            expect(testRouteButton).toBeChecked();

            // check the get route function has been called, with the correct information
            expect(axios.get).toHaveBeenNthCalledWith(4, "/get_route", {"headers": {"Authorization": "Bearer test_token"}, "params": {"route_id": 2, "route_user_id": 0}});

            // check the Polyline route has been created, with the intended positions
            expect(Polyline).toHaveBeenCalledWith({"pathOptions": {"color": "#35CBF4", "fillColor": "red"}, "positions": [[53.808346, -1.561104], [53.808331, -1.561051], [53.80851, -1.5609], [53.808607, -1.561162]]}, {});

            // get the clickable polyline
            mockPolyline = screen.getAllByTestId("mock-polyline")[1];
            expect(mockPolyline).toBeInTheDocument();
        });

        userEvent.click(mockPolyline);

        await waitFor(() => {
            const downloadButton = screen.getByText("Download");
            expect(downloadButton).toBeInTheDocument();

            userEvent.click(downloadButton);
            expect(axios.get).toHaveBeenNthCalledWith(5, "/download_route", {"headers": {"Authorization": "Bearer test_token"}, "params": {"route_id": 2}});
        });
    });

    // check that clicking on a route again makes delete and download disappear
    it("Toggle delete/download buttons", async () => {
        const {container} = render(<MemoryRouter><Journeys token={token} setToken={setToken}/></MemoryRouter>);

        let testRouteButton;

        // wait for both of the axios get calls are made and get the "test route" button
        await waitFor(() => {
            testRouteButton = screen.getByLabelText("test route");

            expect(testRouteButton).toBeInTheDocument();
        });

        userEvent.click(testRouteButton);

        // check that the buttons don't appear at the start of the test
        await waitFor(() => {
            const downloadButton = screen.queryByText("Download");
            expect(downloadButton).toBeNull();

            const deleteButton = screen.queryByText("Delete");
            expect(deleteButton).toBeNull();
        });

        let mockPolyline;

        await waitFor(() => {
            expect(testRouteButton).toBeChecked();

            // get the clickable polyline
            mockPolyline = screen.getAllByTestId("mock-polyline")[1];
            expect(mockPolyline).toBeInTheDocument();
        });

        userEvent.click(mockPolyline);

        await waitFor(() => {
            const downloadButton = screen.getByText("Download");
            expect(downloadButton).toBeInTheDocument();

            const deleteButton = screen.getByText("Delete");
            expect(deleteButton).toBeInTheDocument();
        });

        userEvent.click(mockPolyline);

        // check that the buttons disappear after clicking the polyline again
        await waitFor(() => {
            const downloadButton = screen.queryByText("Download");
            expect(downloadButton).toBeNull();

            const deleteButton = screen.queryByText("Delete");
            expect(deleteButton).toBeNull();
        });
    });

    // upload route works as intended, by sending the correct information to the backend
    it("Upload route form", async () => {
        const {container} = render(<MemoryRouter><Journeys token={token} setToken={setToken}/></MemoryRouter>);

        const mockGPXData = `<?xml version="1.0" encoding="UTF-8"?>
                                <gpx version="1.1" creator="MockCreator" xmlns="http://www.topografix.com/GPX/1/1">
                                  <trk>
                                    <name>Example Track</name>
                                    <trkseg>
                                      <trkpt lat="53.808346" lon="-1.561104">
                                        <time>2022-01-01T00:00:00Z</time>
                                      </trkpt>
                                      <trkpt lat="53.808331" lon="-1.561051">
                                        <time>2022-01-01T00:01:00Z</time>
                                      </trkpt>
                                      <trkpt lat="53.80851" lon="-1.5609">
                                        <time>2022-01-01T00:02:00Z</time>
                                      </trkpt>
                                      <trkpt lat="53.808607" lon="-1.561162">
                                        <time>2022-01-01T00:03:00Z</time>
                                      </trkpt>
                                    </trkseg>
                                  </trk>
                                </gpx>`

        const routeNameInput = screen.getByPlaceholderText("Route Name");
        const fileInput = container.querySelector('input[type="file"]');
        const uploadFileButton = screen.getByText("Upload");

        expect(routeNameInput).toBeInTheDocument();
        expect(fileInput).toBeInTheDocument();
        expect(uploadFileButton).toBeInTheDocument();

        let mockRouteFile = new File([mockGPXData], "testRoute1.gpx", { type: "application/gpx+xml" });

        await waitFor(async () => {
            await userEvent.type(routeNameInput, "test route 1");

            await userEvent.upload(fileInput, mockRouteFile);

            await userEvent.click(uploadFileButton);

            // check a post call has been made
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        const postCall = axios.post.mock.calls[0];

        const requestLocation = postCall[0];
        const formData = postCall[1];

        // check the request is going to the upload link in the backend
        expect(requestLocation).toBe("/upload");

        // check the name of the uploaded route is as intended
        expect(formData.get("routeName")).toBe("test route 1");

        // check the file submitted to the backend is the same as the one uploaded
        expect(formData.get("routeFile")).toBe(mockRouteFile);
    });
});
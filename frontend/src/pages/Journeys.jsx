import React, {useState, useEffect, useRef} from 'react';
import {MapContainer, TileLayer, Marker, Popup, Polyline, useMap} from 'react-leaflet'
import L from 'leaflet';
import "../components/leaflet-images/leaflet.css"
import axios from "axios";


/**
 * This is the "pinpoint" logo
 * @param {string} colour - The outside colour of the logo, a light blue default colour
 * @returns {string} - The string representation of the SVG of the logo
 */
const logoSVG = (colour = "#35CBF4") => {
    return ('<svg style="background-color: transparent;" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100%" fill="none" viewBox="87 37 325 325"> <path fill="' + colour + '" opacity="1.000000" stroke="none" d=" M298.873291,49.111588 C327.689667,65.118835 345.269867,89.030930 351.377686,121.012062 C355.353149,141.828125 353.222473,162.305710 343.692688,181.320129 C320.677185,227.241943 297.149719,272.907196 273.824615,318.673798 C267.332642,331.411804 260.833496,344.146179 254.317307,356.871826 C253.501572,358.464905 252.560684,359.993896 251.351761,362.128113 C245.821655,351.414032 240.552475,341.259155 235.330887,331.079865 C211.871933,285.347565 188.605072,239.515396 164.874268,193.924683 C157.111801,179.011749 150.855942,163.909470 149.768188,146.897491 C147.708878,114.691170 158.074036,87.216766 181.427139,65.116844 C200.239731,47.313778 222.694809,37.932129 249.047745,37.682552 C266.614899,37.516178 283.054474,40.749722 298.873291,49.111588 M166.106766,152.144089 C169.151413,161.773224 170.957321,172.027512 175.448349,180.926743 C198.840973,227.280472 222.914398,273.290680 246.760834,319.415283 C248.305344,322.402679 249.933258,325.346985 251.872681,328.964813 C253.253784,326.495758 254.179993,324.949738 255.003601,323.350800 C264.453400,305.005280 273.961334,286.689178 283.309387,268.291840 C298.979675,237.452087 315.012878,206.783722 329.986237,175.607559 C339.521515,155.753998 340.166901,134.585541 332.884277,113.808502 C322.137604,83.148705 300.581055,63.740967 268.713806,57.073704 C237.381485,50.518353 210.263107,59.679478 188.395935,82.768982 C170.323624,101.851448 163.468491,125.150948 166.106766,152.144089 z"/> <path fill="#082C44" opacity="1.000000" stroke="none" d=" M166.059555,151.696976 C163.468491,125.150948 170.323624,101.851448 188.395935,82.768982 C210.263107,59.679478 237.381485,50.518353 268.713806,57.073704 C300.581055,63.740967 322.137604,83.148705 332.884277,113.808502 C340.166901,134.585541 339.521515,155.753998 329.986237,175.607559 C315.012878,206.783722 298.979675,237.452087 283.309387,268.291840 C273.961334,286.689178 264.453400,305.005280 255.003601,323.350800 C254.179993,324.949738 253.253784,326.495758 251.872681,328.964813 C249.933258,325.346985 248.305344,322.402679 246.760834,319.415283 C222.914398,273.290680 198.840973,227.280472 175.448349,180.926743 C170.957321,172.027512 169.151413,161.773224 166.059555,151.696976 M250.745697,282.098511 C251.419174,281.399048 252.320801,280.812164 252.730270,279.982452 C256.187683,272.976562 259.601379,265.948120 262.934998,258.882446 C265.624512,253.181946 270.310181,247.381104 270.204987,241.697021 C270.099640,236.003326 265.168945,230.391296 262.324921,224.757767 C258.754333,217.684952 255.154892,210.626678 251.391083,203.213837 C253.052704,203.034164 254.022018,202.901840 254.995773,202.827988 C298.414764,199.535553 320.380005,158.840454 311.429657,125.589989 C304.229034,98.839661 279.672333,79.141266 251.731613,79.091797 C223.884689,79.042496 198.639893,98.542542 191.853104,125.325668 C187.501114,142.500259 191.019058,158.408417 198.653519,174.057816 C216.073807,209.766602 233.043015,245.695450 250.745697,282.098511 z"/> <path fill="#E7F0F3" opacity="1.000000" stroke="none" d=" M250.470581,281.816711 C233.043015,245.695450 216.073807,209.766602 198.653519,174.057816 C191.019058,158.408417 187.501114,142.500259 191.853104,125.325668 C198.639893,98.542542 223.884689,79.042496 251.731613,79.091797 C279.672333,79.141266 304.229034,98.839661 311.429657,125.589989 C320.380005,158.840454 298.414764,199.535553 254.995773,202.827988 C254.022018,202.901840 253.052704,203.034164 251.391083,203.213837 C255.154892,210.626678 258.754333,217.684952 262.324921,224.757767 C265.168945,230.391296 270.099640,236.003326 270.204987,241.697021 C270.310181,247.381104 265.624512,253.181946 262.934998,258.882446 C259.601379,265.948120 256.187683,272.976562 252.730270,279.982452 C252.320801,280.812164 251.419174,281.399048 250.470581,281.816711 M260.247589,171.042038 C261.341888,170.651382 262.450653,170.296844 263.528290,169.864655 C279.094360,163.621643 286.911285,145.435165 280.811707,129.675079 C274.923737,114.461784 257.195068,106.200157 241.789322,111.490486 C226.381821,116.781425 217.098511,133.517975 221.286087,148.455017 C226.145737,165.789368 241.577713,175.006943 260.247589,171.042038 z"/> <path fill="#06253A" opacity="1.000000" stroke="none" d=" M259.841797,171.142075 C241.577713,175.006943 226.145737,165.789368 221.286087,148.455017 C217.098511,133.517975 226.381821,116.781425 241.789322,111.490486 C257.195068,106.200157 274.923737,114.461784 280.811707,129.675079 C286.911285,145.435165 279.094360,163.621643 263.528290,169.864655 C262.450653,170.296844 261.341888,170.651382 259.841797,171.142075 z"/> </svg>')
};

// The colours that the routes can be
const colours = ["#35CBF4", "red", "green", "yellow", "orange", "purple", "black", "white", "grey", "pink"];


/**
 * Renders a react-leaflet map and displays GPX route data from the backend
 * @param {token} props - the browser token
 * @param {setToken} props - function to set the browser token
 * @returns {JSX.Element} - the map and routes plotted on it
 */
function Journeys(props) {
    // useStates cause the page to be updated when their values get updated
    const [selectedRoutes, setSelectedRoutes] = useState([]);
    const [allGPXRoutesID, setAllGPXRoutesID] = useState([]);
    const [allRouteNames, setAllRouteNames] = useState([]);
    const [displayedRoutes, setDisplayedRoutes] = useState([]);
    const [clickedRoute, setClickedRoute] = useState(["", "", ""]);
    const [routeDeleted, setRouteDeleted] = useState(false);
    const [mapDesign, setMapDesign] = useState("https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=WciRgLACTjTCzSoL3V3sXiD8IEhWI9HktaHdRU4yNR9tXd3AzvEjLeOIpWZILDyO");


    // Gets routes to display each time the checked routes change
    useEffect(() => {

        fetchRoutes();
        displayRoutes();

        // Async function to fetch route list
        async function fetchRoutes() {
            const routesList = await GetRouteList(props);
            if (!routesList) {
                // Handle case where routesList is null or undefined
                setAllGPXRoutesID([]);
                setAllRouteNames([]);
                return;
            }
            // Update state with fetched routes
            setAllGPXRoutesID(routesList);

            let namesList = []
            // These route names are to be displayed on the side panel
            for(let i = 0; i < routesList.length; i++)
            {
                namesList.push(routesList[i][1]);
            }
            setAllRouteNames(namesList);
        }

        // Async function to get the selected routes and display them
        async function displayRoutes() {
            let routesToDisplay = [];
            let colourNum = 0;
            // Go through all selected routes, finds their ID and gets the GPS data to display
            for (let i = 0; i < selectedRoutes.length; i++) {
                for (let j = 0; j < allGPXRoutesID.length; j++) {
                    if (selectedRoutes[i] === allGPXRoutesID[j][1]) {
                        // request the route from the ID
                        let routeUserID = allGPXRoutesID[j][0];
                        let routeID = allGPXRoutesID[j][1];
                        let routeName = allGPXRoutesID[j][2];
                        let routeCoords = await FetchRouteData(props, routeID, routeUserID);
                        // Add the route to the list of routes to display
                        routesToDisplay.push([routeUserID, routeID, routeName, routeCoords, colours[colourNum]]);
                        colourNum++;
                    }
                }
            }

            // Set the useState, so that displayedRoutes contains all the routes to be displayed on the map
            setDisplayedRoutes(routesToDisplay);
        }

        // If a route has been deleted, update the displayed routes
        if (routeDeleted) {
            setRouteDeleted(false);
        }

    },[props.token, selectedRoutes, routeDeleted]);

    // Function to display a route on the map
    function displayRoute(routeUserID, routeID, routeName, routeCoords, routeColour) {
        // Finds the start and endpoint of the route
        let startPoint = routeCoords[0];
        let endPoint = routeCoords[routeCoords.length - 1];
        // Retrieves the SVG string for the correct colour marker
        const markerIcon = L.divIcon({
            html: logoSVG(routeColour),
            iconSize: [35, 35],
            iconAnchor: [18, 34],
            className: "svg-marker-logo"
        });

        // Returns the JSX of the route, to be displayed on the webpage
        return (
            // this is the visible polyline
            <><Polyline
                // Set up the polyline with the route data
                pathOptions={{ fillColor: 'red', color: routeColour}}
                positions={routeCoords}
            ></Polyline>
                {/* this is the polyline hitbox*/}
                <Polyline
                    // Set up the polyline with the route data
                    pathOptions={{ fillColor: 'red', color: "transparent"}}
                    positions={routeCoords}
                    weight={10}
                    // Set up the event handler for when the route is clicked
                    eventHandlers={{
                        click: (e) => {
                            if (clickedRoute[1] === routeID) {
                                setClickedRoute(["", "", ""]);
                            }
                            else {
                                setClickedRoute([routeUserID, routeID, routeName]);
                            }
                        },
                    }}
                ></Polyline>
                {/* Popups for start and end positions */}
                <Marker position={startPoint} icon={markerIcon}
                        eventHandlers={{
                            click: (e) => {
                                if (clickedRoute[1] === routeID) {
                                    setClickedRoute(["", "", ""]);
                                }
                                else {
                                    setClickedRoute([routeUserID, routeID, routeName]);
                                }
                            },
                        }}
                >
                    <Popup>
                        {routeName + " start point"}
                    </Popup>
                </Marker>
                <Marker position={endPoint} icon={markerIcon}
                        eventHandlers={{
                            click: (e) => {
                                if (clickedRoute[1] === routeID) {
                                    setClickedRoute(["", "", ""]);
                                }
                                else {
                                    setClickedRoute([routeUserID, routeID, routeName]);
                                }
                            },
                        }}
                >
                    <Popup>
                        {routeName + " end point"}
                    </Popup>
                </Marker>
            </>
        );
    }

    // Function to delete a route from the database
    function deleteRoute(routeID) {
        // Send a POST request to the server to delete the route
        axios.post("/delete_route", {route_id: routeID}, {headers: {Authorization: 'Bearer ' + props.token}});
        // Get index of route to delete in allGPXRoutesID
        let index = allGPXRoutesID.findIndex(route => route[1] === routeID);
        let routeName = allGPXRoutesID[index][1];
        // Remove route from allGPXRoutesID
        allGPXRoutesID.splice(index, 1);
        // Remove route from allRouteNames
        let routeIndex = allRouteNames.indexOf(routeName);
        allRouteNames.splice(routeIndex, 1);
        // Remove route from selectedRoutes
        let selectedRouteIndex = selectedRoutes.indexOf(routeName);
        selectedRoutes.splice(selectedRouteIndex, 1);
        // Set routeDeleted to true to trigger useEffect
        setRouteDeleted(true);
        setClickedRoute(["", "", ""]);
    }

    // Function to download a route from the database
    function downloadRoute(routeID) {
        // Send a GET request to the server to download the route
        axios.get("/download_route", {headers: {Authorization: 'Bearer ' + props.token},
            params: {route_id: routeID}}
        ).then(response => {
            // Convert base64 string to blob
            const byteCharacters = atob(response.data.route_data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {type: 'application/octet-stream'});
            const url = window.URL.createObjectURL(blob);

            // Download route as a file
            const link = document.createElement('a');
            link.href = url;
            if (response.data.route_name.includes('.gpx')) {
                link.setAttribute('download', response.data.route_name);
            }
            else {
                link.setAttribute('download', response.data.route_name + '.gpx');
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
            .catch(error => {
                console.error(error);
            });
    }

    // gets the coords of the most recently selected route to pan to.
    let mapCentre = [53.809, -1.553];
    try
    {
        if(displayedRoutes.length !== 0)
        {
            mapCentre = displayedRoutes[displayedRoutes.length - 1][3][0];
        }
    }
    catch {}

    return (
        <div>
            <div className={"journey-page-container"}>

                <SidePanelToggle></SidePanelToggle>

                <MapContainer center={[53.809, -1.553]} zoom={13} scrollWheelZoom={true}>
                    <TileLayer url={mapDesign}/>
                    <PanToRoute startPosition={mapCentre} updatedRouteSelection={displayedRoutes}></PanToRoute>
                    {displayedRoutes.map((route, index) => (
                        <React.Fragment key={index}>
                            {displayRoute(route[0], route[1], route[2], route[3], route[4])}
                        </React.Fragment>
                    ))}
                </MapContainer>
                <SidePanel allGPXRoutesID={allGPXRoutesID} setAllGPXRoutesID={setAllGPXRoutesID} selectedRoutes={selectedRoutes} setSelectedRoutes={setSelectedRoutes} token={props.token} clickedRoute={clickedRoute} deleteRoute={deleteRoute} downloadRoute={downloadRoute}></SidePanel>
                <MapSelector mapDesign={mapDesign} setMapDesign={setMapDesign}></MapSelector>
                <UploadRoute token={props.token} allGPXRoutesID={allGPXRoutesID} setAllGPXRoutesID={setAllGPXRoutesID} setRouteDeleted={setRouteDeleted}></UploadRoute>
            </div>
        </div>
    );
}


/**
 * This displays the side panel containing all the users current routes
 * @param userRoutes - a list of all the users uploaded routes
 * @param selectedRoutes - the current list of routes displayed on the map
 * @param setSelectedRoutes - useState to display the current routes
 * @returns {JSX.Element} - the JSX of the side panel
 * @constructor
 */
function SidePanel(props)
{
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(0);

    // Set the selected friend to be the friend's ID
    const handleSelect = (event) => {
        setSelectedFriend(Number(event.target.value));
    }

    // Get the friends of the user and add to friends list
    function getFriends(){
        axios.get("/get_friends", {
            headers: {Authorization: 'Bearer ' + props.token,}
        })
            .then(response => {
                setFriends(response.data.current_friends);
            })
            .catch(error => {
                console.error(error);
            });
    }

    useEffect(() => {
        getFriends();
    }, []);

    // JSX for the side panel, containing all of the available routes
    return(<div className={"side-panel-container"} onClick={SidePanelToggle} style={{width: "300px"}}>
        <div className="w-full h-full bg-white rounded-2xl box-border overflow-y-auto border-4 border-PinPoint pl-2 pr-2 ml-1">
            <button className="rounded-full px-12 py-3 ml-10 mt-4 mb-4 bg-PinPoint hover:bg-green-600 text-white font-semibold" onClick={ToggleUploadForm}>Upload Route</button>
            <h2 className='ml-2 font-semibold'>Routes:</h2>
            {/* Dropdown to select a friend to view their routes */}
            <label htmlFor="selectRoutes" className="ml-2">Select which routes you'd like to view:</label>
            <select id="selectRoutes" className="ml-2 w-32" value={selectedFriend} onChange={handleSelect}>
                <option key={0} value={0}>My Routes</option>
                {friends.map(([friendID, friendName]) => (
                    <option key={friendID} value={friendID}>{friendName}</option>
                ))}
            </select>

            <br/>
            {/* Display all the routes of the selected friends with checkboxes */}
            {props.allGPXRoutesID && props.allGPXRoutesID.filter(route => route[0] === selectedFriend)
                .map(([userID, routeID, routeName]) => (
                    <div key={[userID, routeID]}>
                        <input
                            className="ml-2 mr-2 mt-4"
                            type="checkbox"
                            id={routeName}
                            name={routeName}
                            checked={props.selectedRoutes.includes(routeID)}
                            onChange={() => ToggleRoute(routeID, props.selectedRoutes, props.setSelectedRoutes)}
                        />
                        <label htmlFor={routeName}>{routeName}</label>

                    </div>
                ))}
            {/*If a route has been clicked, display the delete and download buttons*/}
            {props.clickedRoute[1] !== "" &&
                <div>
                    <h5 className='mt-3 ml-2'>{props.clickedRoute[2]}:</h5>
                    <br/>
                    <div className="flex">
                        {props.clickedRoute[0] === 0 &&
                            <button className="ml-2 mr-4 rounded-full w-20 px-1.5 bg-PinPoint hover:bg-green-600 text-white font-semibold py-2.5" onClick={() => props.deleteRoute(props.clickedRoute[1])}>Delete</button>}
                        <button className="rounded-full w-30 px-1.5 bg-PinPoint hover:bg-green-600 text-white font-semibold py-2.5" onClick={() => props.downloadRoute(props.clickedRoute[1])}>Download</button>
                    </div>
                </div>
            }
        </div></div>)
}


/**
 * The button that opens and closes the left side panel, containing the routes
 * @returns {JSX.Element} - the JSX for the box shape of the button
 * @constructor
 */
function SidePanelToggle()
{
    return(<div className={"side-panel-toggle"} title="Show/Hide Sidebar" onClick={ToggleSidePanel}>
    </div>);
}


/**
 * Toggles the upload form and greys out the background
 * @constructor
 */
function ToggleUploadForm()
{
    let uploadForm = document.getElementsByClassName("grey-background")[0];

    // sets the upload form to be visible
    if(uploadForm.style.zIndex === "1005")
    {
        uploadForm.style.zIndex = "-1";
    }
    // removes the upload form from view
    else
    {
        uploadForm.style.zIndex = "1005";
    }
}


/**
 * Contains the JSX for the upload route form and handles uploading files to the backend
 * @param props - contains the user token
 * @returns {JSX.Element} - JSX for the upload route form
 * @constructor
 */
function UploadRoute(props) {

    // Create state variables for the file and route name
    const [selectedFile, setSelectedFile] = useState(null);
    const [routeName, setRouteName] = useState('');
    const [routeID, setrouteID] = useState(0);
    const [errorMessage, setErrorMessage] = useState(" ");
    const fileInputReference = useRef(null);


    // Update the state when the user selects a file
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Update the state when the user types in the route name
    const handleNameChange = (event) => {
        setRouteName(event.target.value);
    };

    // Send a POST request to the server to upload the file
    const handleUpload = () => {

        // if no file is selected or no routename is given, don't send a backend request
        if (selectedFile === null)
        {
            setErrorMessage("Please provide a valid file");
            return "";
        }
        else if (routeName === "")
        {
            setErrorMessage("Please provide a route name");
            return "";
        }

        // this resets the error message on the form and removes the error message
        if (fileInputReference.current) {
            fileInputReference.current.value = "";
            fileInputReference.current.type = "text";
            fileInputReference.current.type = "file";
        }
        setErrorMessage(" ");

        // Create a FormData object to send the file and route name
        const fileData = new FormData();
        fileData.append('routeFile', selectedFile);
        fileData.append('routeName', routeName);

        // Send the request with file data and authorization header
        axios.post("/upload", fileData, {headers: {Authorization: 'Bearer ' + props.token,
                'Content-Type': 'multipart/form-data'}}
        ).then(response => {
            const data = response.data;
            // If the data contains an access token, set the token (previous token expired)
            if (data.access_token) {
                props.setToken(data.access_token)
            }
            setrouteID(response.data.route_id);
        })
            .catch(error => {
                console.error(error);
            });

        ToggleUploadForm();

        // this updates the list of routes by refreshing the page
        if(selectedFile != null && routeName !== '')
        {
            props.setRouteDeleted(true);
        }

        setSelectedFile(null);
        setRouteName('');
    };

    // Render the upload form
    return (
        <div>
            <div className={"grey-background"} style={{zIndex: "-1"}}>
                <div className="w-[384px] relative bg-white rounded-xl border-8 border-PinPoint box-border">
                    <h1 className='text-2xl mt-2'>Upload File</h1>
                    <button className="absolute top-0 right-0 mr-2.5 text-black" onClick={ToggleUploadForm}>X</button>
                    <label htmlFor="BrowseFiles" className="ml-10"> Select File to upload:
                        <input id="BrowseFiles" className="mt-4 ml-10" type="file" ref={fileInputReference} onChange={handleFileChange}/></label>
                    <label htmlFor="nameRoute" className="ml-10">Enter a name:
                        <input id="nameRoute" type="text" placeholder="Route Name" value={routeName} onChange={handleNameChange}/></label>
                    <p className="mt-2 text-red-600 text-center text-xl">{errorMessage}</p>
                    <button
                        className="rounded-full px-12 py-3 ml-24 mt-4 mb-4 mr-4 bg-PinPoint hover:bg-green-600 text-white font-semibold"
                        onClick={handleUpload}>Upload
                    </button>
                </div>
            </div>
        </div>
    );
}


/**
 * The JSX for the right side panel, which allows the user to select a map style
 * @param props - contains the user token
 * @returns {JSX.Element} - JSX for the right side panel
 * @constructor
 */
function MapSelector(props)
{
    let mapUrls = ["https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=WciRgLACTjTCzSoL3V3sXiD8IEhWI9HktaHdRU4yNR9tXd3AzvEjLeOIpWZILDyO", "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"];
    let mapNames = ["Regular", "Satellite"];

    return(<div className={"map-panel-container"}>
        <div className="w-full h-full bg-white rounded-xl border-4 border-PinPoint box-border pl-3 pt-2 pr-2.5">
            <p className='font-semibold'>Maps:</p>
            {mapNames.map((mapName, index) => (
                <div key={index}>
                    <input className="mr-2" type="radio" id={mapName} name={mapName} checked={props.mapDesign === mapUrls[index]}
                           onChange={() => ChangeMap(mapUrls[index], props.mapDesign, props.setMapDesign)}/>
                    <label htmlFor={mapName}>{mapName}</label>
                </div>
            ))}
        </div>
    </div>)
}


/**
 * Changes the maps appearance based on the sidebar toggle
 * @param selectedMapUrl - the string URl of the chosen map
 * @param currentMap - the currently selected map
 * @param setCurrentMap - function to set the new map
 * @constructor
 */
function ChangeMap(selectedMapUrl, currentMap, setCurrentMap)
{
    setCurrentMap(selectedMapUrl);
}


/**
 * Toggles a route to be shown or not on the map
 * @param {string} route - name of the route that has been selected or deselected
 * @param selectedRoutes - list of currently selected routes, shown on the map
 * @param setSelectedRoutes - useState for changing selectedRoutes
 * @constructor
 */
function ToggleRoute(route, selectedRoutes, setSelectedRoutes)
{
    // if the route clicked has already been selected, remove it from the map
    if (selectedRoutes.includes(route))
    {
        setSelectedRoutes(selectedRoutes.filter(n => n !== route));
    }
    // if a route is clicked add it to the selected routes, that show on the map (limit 10 routes)
    else if (selectedRoutes.length < 10)
    {
        setSelectedRoutes([...selectedRoutes, route]);
    }
}


/**
 * Toggles the side panel to show or appear
 * @constructor
 */
function ToggleSidePanel()
{
    let sidePanelContainer = document.getElementsByClassName("side-panel-container")[0];
    let sidePanelToggle = document.getElementsByClassName("side-panel-toggle")[0];

    // if the side panel is not visible make it appear
    if(sidePanelContainer.style.width === "0px")
    {
        sidePanelContainer.style.width = "300px";
        sidePanelContainer.style.padding = "30px 10px";
        sidePanelToggle.style.marginLeft = "310px";
    }
    // if the side panel is visible make it disappear
    else
    {
        sidePanelContainer.style.width = "0";
        sidePanelContainer.style.padding = "0";
        sidePanelToggle.style.marginLeft = "10px";
    }
}


/**
 * Function to call get_route with a route id to get that route data
 * @param props - this contains the user token
 * @param route_id - the ID of the route in the database
 * @param route_user_id
 * @returns {Promise<unknown>} - returns the GPS data for the given route
 */
async function FetchRouteData(props, route_id, route_user_id)
{
    // send a get request to the backend ot the GPS data of a route
    let responseData =
        await axios.get("/get_route", {
            params: {
                route_id: route_id,
                route_user_id: route_user_id
            },
            headers: {Authorization: 'Bearer ' + props.token}
        })
            .then(response => {
                const data = response.data;
                // If the data contains an access token, update the token
                if (data.access_token) {
                    props.setToken(data.access_token);
                }
                const coordinates = data.coordinates;

                return coordinates;
            })
            .catch(error => {
                console.error("Error from get route: " + error);
            });

    return responseData;
}


/**
 * Function to get the complete route list for a given user
 * @param props - this contains the user token
 * @returns {Promise<*|*[]>} - the complete route list for a given user
 */
async function GetRouteList(props)
{
    let responseData = [];

    // send a get request to the backend for the list of routes
    responseData =
        await axios.get("/get_route_list", {
            headers: {Authorization: 'Bearer ' + props.token,}
        })
            .then(response => {
                // If the data contains an access token, update the token
                if (response.data.access_token) {
                    props.setToken(response.data.access_token);
                }
                responseData = response.data.route_list
                return responseData
            })
            .catch(error => {
                console.error(error);
            });


    return responseData;
}


/**
 * When a route is selected from the sidebar the startpoint is centred on the map
 * @param startPosition - the array containing the coords of the start position of a route
 * @param updatedRouteSelection - the list of selected routes, this is only needed to ensure
 *                                when it is changed a route is panned to
 * @returns {null}
 * @constructor
 */
function PanToRoute({ startPosition, updatedRouteSelection }) {
    const map = useMap();

    useEffect(() => {
        // check the position exists, and it's not the default location then move the centre of the map to that point
        if (startPosition && startPosition.toString() !== [53.809, -1.553].toString())
        {
            map.panTo(startPosition);
        }
        else {}
    }, [map, startPosition, updatedRouteSelection]);

    return null;
}


export default Journeys;
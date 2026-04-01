import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {MapContainer, Polyline, TileLayer, Marker, Popup} from "react-leaflet";
import L from 'leaflet';

/**
 * Home page for the application.
 * @param {token} props - the browser token
 * @param {setToken} props - function to set the browser token
 * @returns {JSX.Element} - the home page
*/


const logoSVG = (colour = "#35CBF4") => {
    return ('<svg style="background-color: transparent;" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100%" fill="none" viewBox="87 37 325 325"> <path fill="' + colour + '" opacity="1.000000" stroke="none" d=" M298.873291,49.111588 C327.689667,65.118835 345.269867,89.030930 351.377686,121.012062 C355.353149,141.828125 353.222473,162.305710 343.692688,181.320129 C320.677185,227.241943 297.149719,272.907196 273.824615,318.673798 C267.332642,331.411804 260.833496,344.146179 254.317307,356.871826 C253.501572,358.464905 252.560684,359.993896 251.351761,362.128113 C245.821655,351.414032 240.552475,341.259155 235.330887,331.079865 C211.871933,285.347565 188.605072,239.515396 164.874268,193.924683 C157.111801,179.011749 150.855942,163.909470 149.768188,146.897491 C147.708878,114.691170 158.074036,87.216766 181.427139,65.116844 C200.239731,47.313778 222.694809,37.932129 249.047745,37.682552 C266.614899,37.516178 283.054474,40.749722 298.873291,49.111588 M166.106766,152.144089 C169.151413,161.773224 170.957321,172.027512 175.448349,180.926743 C198.840973,227.280472 222.914398,273.290680 246.760834,319.415283 C248.305344,322.402679 249.933258,325.346985 251.872681,328.964813 C253.253784,326.495758 254.179993,324.949738 255.003601,323.350800 C264.453400,305.005280 273.961334,286.689178 283.309387,268.291840 C298.979675,237.452087 315.012878,206.783722 329.986237,175.607559 C339.521515,155.753998 340.166901,134.585541 332.884277,113.808502 C322.137604,83.148705 300.581055,63.740967 268.713806,57.073704 C237.381485,50.518353 210.263107,59.679478 188.395935,82.768982 C170.323624,101.851448 163.468491,125.150948 166.106766,152.144089 z"/> <path fill="#082C44" opacity="1.000000" stroke="none" d=" M166.059555,151.696976 C163.468491,125.150948 170.323624,101.851448 188.395935,82.768982 C210.263107,59.679478 237.381485,50.518353 268.713806,57.073704 C300.581055,63.740967 322.137604,83.148705 332.884277,113.808502 C340.166901,134.585541 339.521515,155.753998 329.986237,175.607559 C315.012878,206.783722 298.979675,237.452087 283.309387,268.291840 C273.961334,286.689178 264.453400,305.005280 255.003601,323.350800 C254.179993,324.949738 253.253784,326.495758 251.872681,328.964813 C249.933258,325.346985 248.305344,322.402679 246.760834,319.415283 C222.914398,273.290680 198.840973,227.280472 175.448349,180.926743 C170.957321,172.027512 169.151413,161.773224 166.059555,151.696976 M250.745697,282.098511 C251.419174,281.399048 252.320801,280.812164 252.730270,279.982452 C256.187683,272.976562 259.601379,265.948120 262.934998,258.882446 C265.624512,253.181946 270.310181,247.381104 270.204987,241.697021 C270.099640,236.003326 265.168945,230.391296 262.324921,224.757767 C258.754333,217.684952 255.154892,210.626678 251.391083,203.213837 C253.052704,203.034164 254.022018,202.901840 254.995773,202.827988 C298.414764,199.535553 320.380005,158.840454 311.429657,125.589989 C304.229034,98.839661 279.672333,79.141266 251.731613,79.091797 C223.884689,79.042496 198.639893,98.542542 191.853104,125.325668 C187.501114,142.500259 191.019058,158.408417 198.653519,174.057816 C216.073807,209.766602 233.043015,245.695450 250.745697,282.098511 z"/> <path fill="#E7F0F3" opacity="1.000000" stroke="none" d=" M250.470581,281.816711 C233.043015,245.695450 216.073807,209.766602 198.653519,174.057816 C191.019058,158.408417 187.501114,142.500259 191.853104,125.325668 C198.639893,98.542542 223.884689,79.042496 251.731613,79.091797 C279.672333,79.141266 304.229034,98.839661 311.429657,125.589989 C320.380005,158.840454 298.414764,199.535553 254.995773,202.827988 C254.022018,202.901840 253.052704,203.034164 251.391083,203.213837 C255.154892,210.626678 258.754333,217.684952 262.324921,224.757767 C265.168945,230.391296 270.099640,236.003326 270.204987,241.697021 C270.310181,247.381104 265.624512,253.181946 262.934998,258.882446 C259.601379,265.948120 256.187683,272.976562 252.730270,279.982452 C252.320801,280.812164 251.419174,281.399048 250.470581,281.816711 M260.247589,171.042038 C261.341888,170.651382 262.450653,170.296844 263.528290,169.864655 C279.094360,163.621643 286.911285,145.435165 280.811707,129.675079 C274.923737,114.461784 257.195068,106.200157 241.789322,111.490486 C226.381821,116.781425 217.098511,133.517975 221.286087,148.455017 C226.145737,165.789368 241.577713,175.006943 260.247589,171.042038 z"/> <path fill="#06253A" opacity="1.000000" stroke="none" d=" M259.841797,171.142075 C241.577713,175.006943 226.145737,165.789368 221.286087,148.455017 C217.098511,133.517975 226.381821,116.781425 241.789322,111.490486 C257.195068,106.200157 274.923737,114.461784 280.811707,129.675079 C286.911285,145.435165 279.094360,163.621643 263.528290,169.864655 C262.450653,170.296844 261.341888,170.651382 259.841797,171.142075 z"/> </svg>')
};

const markerIcon = L.divIcon({
    html: logoSVG("green"),
    iconSize: [35, 35],
    iconAnchor: [18, 34],
    className: "svg-marker-logo"
});

function Home(props) {
    // Create state variables for the welcome data
    const [welcomeData, setWelcomeData] = useState(null)
    useEffect(() => {
        // Send a GET request to the server to get the welcome data for the logged in user
        const getWelcomeData = () => {
            axios.get("/welcome", {headers: {Authorization: 'Bearer ' + props.token}})
                .then((response) => {
                const data = response.data;
                // If the data contains an access token, set the token (previous token expired)
                if (data.access_token){
                    props.setToken(data.access_token)
                }
                // Set the welcome data to the user's name
                setWelcomeData(({
                    name: data.name
                }))
            }).catch((error) => {
                if (error.response) {
                    console.log(error.response.data);
                }
            })
        };

        // If the token exists, get the welcome data
        if (props.token !== null && props.token !== undefined){          
            getWelcomeData();
        }
    }, [props.token]);

    // Render the home page
    
    return (
      <div>
        {/* Hero Section */}
        <div className="w-full bg-PinPoint py-32">
          <div className='md:max-w-[1480px] m-auto grid md:grid-cols-2'>
            <div className='pl-4 sm:p-0'>
              <h1 className='md: text-7xl font-semibold text-white text-left py-10'>PinPoint</h1> 
              <h2 className='text-5xl font-medium text-white'>Let us track your journeys, so you don't have to!</h2>
              <Link to="/register"><button className='px-8 py-3 rounded-md bg-blue-600 hover:bg-blue-500 mt-4 text-white font-semibold'>Sign Up</button></Link>
            </div>
            <div className='hidden md:block relative'>
              <div className="flex items-center">
                <img src="/images/PinPointMap.png" alt="PinPoint Map" className='absolute w-2/3 h-auto ml-[100px] mt-[310px] object-cover'/> 

              </div>
            </div>
          </div>
        </div>

   
      {/* Features */}
        <div className='w-full py-[6rem] px-4 bg-light-bg'>
          <h1 className='text-5xl font-bold text-black text-center mb-8'>Our Features</h1>
          <div className='max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8'>
              <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 bg-white'>
                <img className="w-50 mx-auto  bg-white" src="/images/feat_map.png" alt="Map Feature Icon"/>
                <h2 className='text-4xl font-bold text-center py-8'>Plot Routes</h2>
                <div className='text-center text-lg font-medium'>
                  <p className='py-2 border-b mx-8 mt-8'>Upload your GPX data and have your route plotted!</p>
                  <p className='py-2 border-b mx-8'>Colour coded routes make maps clearer</p>
                  <p className='py-2 border-b mx-8'>View up to 10 routes at a time</p>
                </div>
              </div>

            <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 bg-white'>
              <img className="w-50 mx-auto  bg-white" src="/images/add_friends.png" alt="Add Friends Feature Icon"/>
              <h2 className='text-4xl font-bold text-center py-8'>Add Friends</h2>
                <div className='text-center text-lg font-medium'>
                  <p className='py-2 border-b mx-8 mt-8'>Share your routes with friends!</p>
                  <p className='py-2 border-b mx-8'>Add up to 10 friends</p>
                  <p className='py-2 border-b mx-8'>View your routes and your friends' routes on the same map</p>
                </div>
            </div>

            <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300 bg-white'>
              <img className="w-40 mx-auto mt-4 bg-white" src="/images/satellite.png" alt="Satellite Icon"/>
              <h2 className='text-4xl font-bold text-center py-8'>Change Maps</h2>
                <div className='text-center text-lg font-medium'>
                  <p className='py-2 border-b mx-8 mt-8'>Pick different map views!</p>
                  <p className='py-2 border-b mx-8'>Switch to satellite view</p>
                  <p className='py-2 border-b mx-8'>Enjoy a personalised experience</p>
                </div>
            </div>
           </div>  
        </div>

      <div>
      <div className='w-full bg-PinPoint'>
      <div className='lg: max-w-[1480px] m-auto grid lg:grid-cols-2 p-8'>
          <div className="w-[300px] h-[300px] mx-auto lg:w-[450px] lg:h-[450px] bg-[#0DCA6F] relative lg:left-0">
              <MapContainer center={[53.809, -1.553]} zoom={13} scrollWheelZoom={true}>
                  <TileLayer url={"https://tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=WciRgLACTjTCzSoL3V3sXiD8IEhWI9HktaHdRU4yNR9tXd3AzvEjLeOIpWZILDyO"}/>
                  <Marker position={[53.808346, -1.561104]} icon={markerIcon}>
                      <Popup><a>Route End Point</a></Popup>
                  </Marker>
                  <Polyline
                      // Set up the polyline with the route data
                      pathOptions={{ fillColor: 'red', color: "green"}}
                      positions={[[53.808346, -1.561104],
                          [53.808331, -1.561051],
                          [53.80851, -1.5609],
                          [53.808607, -1.561162],
                          [53.80883, -1.561984],
                          [53.808918, -1.562365],
                          [53.809279, -1.563186],
                          [53.809524, -1.563921],
                          [53.80999, -1.565005],
                          [53.810081, -1.5653],
                          [53.810061, -1.565437],
                          [53.810019, -1.565829],
                          [53.810093, -1.56639],
                          [53.810899, -1.565711],
                          [53.810957, -1.566181],
                          [53.811019, -1.566703],
                          [53.811145, -1.567772],
                          [53.811194, -1.568176],
                          [53.811243, -1.568582],
                          [53.811293, -1.568992],
                          [53.811344, -1.569417],
                          [53.81164, -1.569329],
                          [53.811677, -1.569318],
                          [53.811827, -1.569261],
                          [53.812004, -1.569198],
                          [53.81232, -1.5691],
                          [53.812499, -1.569214],
                          [53.812583, -1.569219],
                          [53.812762, -1.569182],
                          [53.812795, -1.56956],
                          [53.812824, -1.569898],
                          [53.812851, -1.570208],
                          [53.812862, -1.570327],
                          [53.812879, -1.570524],
                          [53.812893, -1.570685],
                          [53.812908, -1.570836],
                          [53.812939, -1.571164],
                          [53.812969, -1.571477],
                          [53.812988, -1.57167],
                          [53.813, -1.571796],
                          [53.813039, -1.572204],
                          [53.813085, -1.572683],
                          [53.813091, -1.572741],
                          [53.813094, -1.572778],
                          [53.813098, -1.572827],
                          [53.813125, -1.573171],
                          [53.81312, -1.573256],
                          [53.81308, -1.573851],
                          [53.813067, -1.574002],
                          [53.813023, -1.574534],
                          [53.813002, -1.574741],
                          [53.812978, -1.574897],
                          [53.812948, -1.575104],
                          [53.81293, -1.575216],
                          [53.813053, -1.575186],
                          [53.813095, -1.575176],
                          [53.813218, -1.575147],
                          [53.81355, -1.575063],
                          [53.81401, -1.574946],
                          [53.814304, -1.57487],
                          [53.81431, -1.574773],
                          [53.814348, -1.574195],
                          [53.814355, -1.574052],
                          [53.814839, -1.573989],
                          [53.814839, -1.573859],
                          [53.814836, -1.573503],
                          [53.814825, -1.573175],
                          [53.814829, -1.573118],
                          [53.814848, -1.573095],
                          [53.815708, -1.572691],
                          [53.815675, -1.572296],
                          [53.815681, -1.572227],
                          [53.815716, -1.572201],
                          [53.816234, -1.571945],
                          [53.816063, -1.571131],
                          [53.815971, -1.570667],
                          [53.815812, -1.569793],
                          [53.816855, -1.569543],
                          [53.816907, -1.56951],
                          [53.816825, -1.569205],
                          [53.816771, -1.568928],
                          [53.816648, -1.568187],
                          [53.81657, -1.567746],
                          [53.816483, -1.567315],
                          [53.816389, -1.566884],
                          [53.81631, -1.566542],
                          [53.816136, -1.565847],
                          [53.815993, -1.565305],
                          [53.815853, -1.564823],
                          [53.815822, -1.564713],
                          [53.815642, -1.564133],
                          [53.815995, -1.564013],
                          [53.816139, -1.563964],
                          [53.816161, -1.563958],
                          [53.81604, -1.563181],
                          [53.81582, -1.561887],
                          [53.815729, -1.561355],
                          [53.815999, -1.561231],
                          [53.815983, -1.561104],
                          [53.815911, -1.560815],
                          [53.815825, -1.560413],
                          [53.815542, -1.560352],
                          [53.814919, -1.560245],
                          [53.814801, -1.560219],
                          [53.814617, -1.560179],
                          [53.814511, -1.560166],
                          [53.814268, -1.560137],
                          [53.813929, -1.56021],
                          [53.8139, -1.560216],
                          [53.813843, -1.560266],
                          [53.813779, -1.560182],
                          [53.813485, -1.559781],
                          [53.812799, -1.55884],
                          [53.811934, -1.557686],
                          [53.811425, -1.55703],
                          [53.811095, -1.556593],
                          [53.811036, -1.556508],
                          [53.811044, -1.556466],
                          [53.810938, -1.556339],
                          [53.810885, -1.556455],
                          [53.810868, -1.556492],
                          [53.810834, -1.556467],
                          [53.81071, -1.556371],
                          [53.810616, -1.556601],
                          [53.810523, -1.55685],
                          [53.810412, -1.557111],
                          [53.810287, -1.557393],
                          [53.810112, -1.557697],
                          [53.809955, -1.557897],
                          [53.809808, -1.558052],
                          [53.809702, -1.558149],
                          [53.809585, -1.558236],
                          [53.809373, -1.558345],
                          [53.809355, -1.558245],
                          [53.80935, -1.558212],
                          [53.809341, -1.558173],
                          [53.809338, -1.558164],
                          [53.809341, -1.558173],
                          [53.808545, -1.558624],
                          [53.808585, -1.558845],
                          [53.808156, -1.559351],
                          [53.808155, -1.559709],
                          [53.808127, -1.559756],
                          [53.808118, -1.559841],
                          [53.808144, -1.559919],
                          [53.808186, -1.559948],
                          [53.808235, -1.559927],
                          [53.80826, -1.559892],
                          [53.808547, -1.560083],
                          [53.808784, -1.560228],
                          [53.80962, -1.560672],
                          [53.810208, -1.560886],
                          [53.810354, -1.56094],
                          [53.810472, -1.56097],
                          [53.810767, -1.560995],
                          [53.81102, -1.561004],
                          [53.811009, -1.560855],
                          [53.811009, -1.560849],
                          [53.810978, -1.560745],
                          [53.811438, -1.560265],
                          [53.811639, -1.560077],
                          [53.811654, -1.560124]
                      ]}
                  ></Polyline>
                  <Marker position={[53.811654, -1.560124]} icon={markerIcon}>
                      <Popup><a>Route Start Point</a></Popup>
                  </Marker>
              </MapContainer>
          </div>
          <div>
            <h1 className='md: text-7xl font-semibold text-white py-8'>Have a go!</h1> 
            <h2 className='text-4xl font-medium text-white py-2'>Interact with the map to see what your journeys would look like!</h2>
            <h2 className='text-2xl font-medium text-white'>Step 1: Register</h2>
            <h2 className='text-2xl font-medium text-white'>Step 2: Choose a plan</h2>
            <h2 className='text-2xl font-medium text-white'>Step 3: You're ready to use PinPoint!</h2>
          </div>
          </div>
          </div>
      </div>


      <div className='w-full py-[6rem] px-4 bg-light-bg'>
      <h1 className='text-5xl font-bold text-black text-center mb-8'>Subscriptions</h1>
        <div className='max-w-[1240px] mx-auto grid md:grid-cols-3 gap-8'>
          <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-xl hover:scale-105 duration-300 bg-white'>
            <h2 className='text-2xl font-bold text-center py-8'>Weekly</h2>
            <h3 className='text-center text-5xl font-bold'>£2.00/w</h3>
            <div className='text-center font-medium'>
              <p className='py-2 mx-8 mt-8'>The weekly subsciption is great for those who want something short-term!</p>
            </div>
            <div className='flex justify-center'>
            <Link to="/register"><button className='bg-blue-600 w-[200px] rounded-md font-semibold my-6 mx-auto px-6 py-3 hover:bg-blue-500 no-underline text-white'
             >
              Sign Up Now!
            </button></Link></div>
          </div>

          <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-xl hover:scale-105 duration-300 bg-white'>
            <h2 className='text-2xl font-bold text-center py-8'>Monthly</h2>
            <h3 className='text-center text-5xl font-bold'>£7.00/m</h3>
            <div className='text-center font-medium'>
              <p className='py-2 mx-8 mt-8'>Monthly members save more! Join today to start PinPointing!</p>
            </div>
            <div className='flex justify-center'>
            <Link to="/register"><button className='bg-blue-600 w-[200px] rounded-md font-semibold my-6 mx-auto px-6 py-3 hover:bg-blue-500 no-underline text-white'
             >
              Sign Up Now!
            </button></Link></div>
          </div>

          <div className='w-full shadow-xl flex flex-col p-4 my-4 rounded-xl hover:scale-105 duration-300 bg-white'>
            <h2 className='text-2xl font-bold text-center py-8'>Annually</h2>
            <h3 className='text-center text-5xl font-bold'>£80.00/a</h3>
            <div className='text-center font-medium'>
              <p className='py-2 mx-8 mt-8'>Enjoy PinPoint's features ALL. YEAR. LONG.</p>
            </div>
            <div className='flex justify-center'>
            <Link to="/register"><button className='bg-blue-600 w-[200px] rounded-md font-semibold my-6 mx-auto px-6 py-3 hover:bg-blue-500 no-underline text-white'
             >
              Sign Up Now!
            </button></Link></div>
          </div>
        </div>
      </div>
      </div>
      );
}

export default Home;
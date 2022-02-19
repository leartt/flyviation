const express = require('express');
const axios = require('axios');
const cors = require('cors');

const path = require("path");
require('dotenv').config({
    path: path.join(__dirname, "../.env")
});

// initialize express
const app = express();

// middlewares
app.use(express.json());
app.use(cors());

const FLIGHT_API_URL = process.env.FLIGHT_API_URL;

app.get('/api/v1/flights', async (req, res) => {
    try {
        const { data: originalData } = await axios.get(FLIGHT_API_URL);

        // get flightIds and skip 2 first elements not needed
        const flightIds = Object.keys(originalData).slice(2);

        /* data returned as object with unique key (value as array)
            need to manipulate data and make ready for frontend */
        let flightIndex = 0;
        const flights = Object.values(originalData).map((data, idx) => {
            if (Array.isArray(data)) {
                // const departureAirport = airports.find(airport => airport.iata == data[11]);
                // const arrivalAirport = airports.find(airport => airport.iata == data[12]);
                // const aircraft = aircrafts.find(aircraft => aircraft.icaoCode == data[8]);

                return {
                    flightId: flightIds[flightIndex++],
                    lat: data[1],
                    long: data[2],
                    angle: data[3],
                    altitude: Math.round(Number(data[4] / 3.281)), // convert from ft to meters
                    speed: Math.round(Number(data[5] * 1.852)), // convert from knots to kmh
                    aircraft: data[8],
                    // departure: departureAirport,
                    // arrival: arrivalAirport,
                    flightNumber: data[13],
                    alternativeFlightNumber: data[16],
                    airlineCode: data[18],
                };
            }
        })

        return res.status(200).json({ success: true, flights });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : null
        })
    }
})

app.get("/api/v1/flights/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { data: flights } = await axios.get(`http://localhost:${PORT}/api/v1/flights`);
        const specificFlight = flights.flights.find(f => f?.flightId === id);

        const { data } = await axios.get(`https://data-live.flightradar24.com/clickhandler/?&flight=${specificFlight.flightId}`);

        const flight = {
            ...specificFlight,
            id: data.identification?.id,
            callsign: data.identification.callsign,
            flightNumber: data.identification.number.default,
            status: {
                live: data.status.live,
                text: data.status.text
            },
            aircraft: {
                code: data.aircraft.model.code,
                text: data.aircraft.model.text,
                registration: data.aircraft.registration,
                imageUrl: data.aircraft.images?.large[0]?.src
            },
            airline: {
                name: data.airline.name,
                iata: data.airline.code?.iata,
                icao: data.airline.code?.icao,
            },
            departure: {
                name: data.airport.origin.name,
                iata: data.airport.origin.code.iata,
                icao: data.airport.origin.code.icao,
                latitute: data.airport.origin.position.latitude,
                longitude: data.airport.origin.position.longitude,
                country: {
                    name: data.airport.origin.position.country.name,
                    code: data.airport.origin.position.country.code,
                    city: data.airport.origin.position.region.city
                },
                timezone: {
                    name: data.airport.origin.timezone.name,
                    offset: data.airport.origin.timezone.offset / 60, // convert from sec to mins
                    abbr: data.airport.origin.timezone.abbr,
                    offsetHours: data.airport.origin.timezone.offsetHours
                }
            },
            arrival: {
                name: data.airport.destination.name,
                iata: data.airport.destination.code.iata,
                icao: data.airport.destination.code.icao,
                latitute: data.airport.destination.position.latitude,
                longitude: data.airport.destination.position.longitude,
                country: {
                    name: data.airport.destination.position.country.name,
                    code: data.airport.destination.position.country.code,
                    city: data.airport.destination.position.region.city
                },
                timezone: {
                    name: data.airport.destination.timezone.name,
                    offset: data.airport.destination.timezone.offset / 60, // convert from sec to mins
                    abbr: data.airport.destination.timezone.abbr,
                    offsetHours: data.airport.destination.timezone.offsetHours
                }
            },
            time: data.time,
            trails: data.trail.map(trail => [trail["lat"], trail["lng"]])
        }

        return res.status(200).json({ success: true, flight })

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : null
        })
    }
})

app.get("*", (req, res) => {
    return res.status(404).end("404. Not found")
})


const PORT = process.env.PORT || 5500;

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
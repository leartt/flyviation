const express = require('express');
const axios = require('axios');

const path = require("path");
require('dotenv').config({
    path: path.join(__dirname, "../.env")
});

// initialize express
const app = express();

// middlewares
app.use(express.json());
app.use(cors());

const FLIGHT_API_URL = "https://data-live.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=57.282%2C36.847%2C0.178%2C27.247&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&estimated=1&maxage=14400";

app.get('/', (req, res) => {
    res.json({ msg: "Hello from Express" });
})

app.get('/api/v1/flights', async (req, res) => {
    try {
        const { data: originalData } = await axios.get(FLIGHT_API_URL);

        // data returned as object with unique key (value as array)
        // need to manipulate data and make ready for frontend
        const flights = Object.values(originalData).map(data => {
            if (Array.isArray(data)) {
                return {
                    lat: data[1],
                    long: data[2],
                    angle: data[3],
                    altitude: data[4],
                    speed: data[5],
                    aircraftCode: data[8],
                    departure: data[11],
                    arrival: data[12],
                    flightNumber: data[13],
                    alternativeFlightNumber: data[16],
                    airlineCode: data[18],
                };
            }
        })

        return res.status(200).json(flights);

    } catch (error) {
        return res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : null
        })
    }
})

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
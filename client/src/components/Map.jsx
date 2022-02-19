import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import RotatedMarker from './RotatedMarker'
import axios from 'axios';

import airplane from '../airplane.png'
import SpecificFlight from './SpecificFlight';

const airplaneIcon = L.icon({
    iconUrl: airplane,
    iconSize: [30, 30],
});


const Map = () => {
    const [flights, setFlights] = useState([]);
    const [selectedFlightId, setSelectedFlightId] = useState(null);
    const [isShowSpecificFlight, setIsShowSpecificFlight] = useState(false);

    const getLiveFlights = async () => {
        try {
            const res = await axios.get('http://localhost:5500/api/v1/flights');
            if (res.data.success) {
                setFlights(res.data.flights);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getLiveFlights();
    }, [])

    useEffect(() => {

        const intervalId = setInterval(getLiveFlights, 3000);

        return () => {
            console.log("Interval cleared")
            clearInterval(intervalId);
        }

    }, [flights])

    const showSpecificFlight = (id) => {
        setSelectedFlightId(id)
        setIsShowSpecificFlight(true);
    }

    const removeSpecificFlight = () => {
        setSelectedFlightId(null)
        setIsShowSpecificFlight(false);
    }

    return (
        <MapContainer id="flight-map" center={[48.77, 9.18]} zoom={5}>
            {isShowSpecificFlight && <SpecificFlight flightId={selectedFlightId} removeSpecificFlight={removeSpecificFlight} />}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            // subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />
            {flights?.length > 0 ? flights?.map((flight, idx) => (
                <RotatedMarker key={idx} position={[flight?.lat || 0, flight?.long || 0]} icon={airplaneIcon} rotationAngle={flight?.angle} rotationOrigin="center"
                    eventHandlers={{ click: () => showSpecificFlight(flight?.flightId) }}
                    riseOnHover={true}>
                    <Tooltip direction="top">
                        <strong>{flight?.flightNumber || flight?.alternativeFlightNumber}</strong>
                    </Tooltip>
                </RotatedMarker>
            )) : ""}
        </MapContainer>
    )
}

export default Map;
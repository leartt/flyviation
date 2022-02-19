import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Polygon, Polyline } from 'react-leaflet';
import axios from 'axios';
import moment from 'moment';

import {
    MdFlightTakeoff as PlaneTakeoffIcon,
    MdFlightLand as PlaneLandIcon
} from 'react-icons/md';
import LoadingIcon from "../loading.svg";
import "./styles.css";

const SpecificFlight = ({ flightId, removeSpecificFlight }) => {

    const [specificFlight, setSpecificFlight] = useState(null)

    const timeFormater = (time, offset) => {
        console.log(time, offset);
        return moment.unix(time).utc().utcOffset(offset).format("HH:mm")
    };

    const getSpecificFlight = async () => {
        try {
            const res = await axios.get(`http://localhost:5500/api/v1/flights/${flightId}`)
            if (res.data.success) {
                setSpecificFlight(res.data.flight)
            }

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getSpecificFlight();

        return () => {
            setSpecificFlight(null);
        }

    }, [flightId])

    useEffect(() => {

        const intervalId = setInterval(getSpecificFlight, 3000);

        return () => {
            console.log("Interval cleared SPECIFIC FLIGHT")
            clearInterval(intervalId);
        }

    }, [specificFlight])

    console.log("RENDERING SPECIFIC FLIGHT component");



    return (
        <div className="SpecificFlight">
            {specificFlight ?
                <div className="SpecificFlight__container">
                    <Polyline positions={specificFlight?.trails} pathOptions={{ color: "#e48900", weight: 3 }} />
                    <div className="SpecificFlight--upper">
                        <div className="close-btn" onClick={removeSpecificFlight}>&times;</div>
                        <span className="flight-number">{specificFlight?.flightNumber}</span>
                        {"/"}
                        <span><small className="flight-callsign">{specificFlight?.callsign}</small></span>
                        <p className="flight-airline">{specificFlight?.airline?.name}</p>
                    </div>
                    <img src={specificFlight?.aircraft.imageUrl || ""} className="SpecificFlight__img" />
                    <div className="SpecificFlight--airport">
                        <div className='departure'>
                            <h2 className='iata'>{specificFlight?.departure?.iata}</h2>
                            <h5 className='city'>{specificFlight?.departure?.country?.city}</h5>
                            <PlaneTakeoffIcon />
                            <p className='timezone'>{`${specificFlight?.departure?.timezone.abbr} (UTC ${specificFlight?.departure?.timezone.offsetHours.toString().startsWith("-") ? specificFlight?.departure?.timezone.offsetHours : "+" + specificFlight?.departure?.timezone.offsetHours})`}</p>
                            <div className='scheduled-time'>
                                <span>Scheduled</span>
                                {(specificFlight?.time?.scheduled.departure && specificFlight?.time?.scheduled.arrival) ?
                                    <h4>
                                        {timeFormater(specificFlight?.time?.scheduled.departure, specificFlight?.departure.timezone.offset)}
                                    </h4> : "--"}
                            </div>
                            {specificFlight.status.live && <div className='scheduled-time'>
                                <span>Actual</span>
                                <h4>{timeFormater(specificFlight?.time?.real.departure, specificFlight?.departure.timezone.offset)}</h4>
                            </div>}
                        </div>
                        <div className='arrival'>
                            <h2 className='iata'>{specificFlight?.arrival?.iata}</h2>
                            <h5 className='city'>{specificFlight?.arrival?.country?.city}</h5>
                            <PlaneLandIcon />
                            <p className='timezone'>{`${specificFlight?.arrival?.timezone.abbr} (UTC ${specificFlight?.arrival?.timezone.offsetHours.toString().startsWith("-") ? specificFlight?.arrival?.timezone.offsetHours : "+" + specificFlight?.arrival?.timezone.offsetHours})`}</p>
                            <div className='scheduled-time'>
                                <span>Scheduled</span>
                                {(specificFlight?.time?.scheduled.arrival && specificFlight?.time?.scheduled.arrival) ?
                                    <h4>{timeFormater(specificFlight?.time?.scheduled.arrival, specificFlight?.arrival.timezone.offset)}
                                    </h4> : "--"}
                            </div>
                            <div className='scheduled-time'>
                                <span>Estimated</span>
                                <h4>{specificFlight.status.live ?
                                    timeFormater((specificFlight?.time?.estimated.arrival || specificFlight?.time?.scheduled.arrival), specificFlight?.arrival.timezone.offset)
                                    : timeFormater(specificFlight?.time?.real.arrival, specificFlight?.arrival.timezone.offset)}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="SpecificFlight--aircraft">
                        <div>
                            <div className='aircraft-type'>Aircraft Type <small>({specificFlight?.aircraft?.code})</small></div>
                            <h5 className='aircraft-text'>{specificFlight?.aircraft?.text}</h5>
                        </div>
                        <div>
                            <div className='aircraft-reg'>Registration: <small>({specificFlight?.aircraft?.registration})</small></div>
                        </div>
                    </div>
                    <div className="divider"></div>
                    <div className="SpecificFlight--info">
                        <div className="altitude">
                            <div>Altitude</div>
                            <h4>{specificFlight?.altitude} m</h4>
                        </div>
                        <div className="speed">
                            <div>Speed</div>
                            <h4>{specificFlight?.speed} km/h</h4>
                        </div>
                        <div className="track">
                            <div>Track</div>
                            <h4>{specificFlight?.angle}°</h4>
                        </div>
                        <div className="status">
                            <div>Status</div>
                            <h4>{specificFlight?.status.live ? "Live" : "Not Live"}</h4>
                        </div>
                    </div>

                </div> : <img className="loading--icon" src={LoadingIcon} alt="loading" />}
        </div>
    )
}

export default React.memo(SpecificFlight);

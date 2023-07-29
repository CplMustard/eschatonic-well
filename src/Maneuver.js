import React, { useState, useEffect } from 'react';

import { maneuversData } from './data';

function Maneuver(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [maneuverData, setManeuverData] = useState({});

    useEffect(() => {
        setIsLoaded(true);
        setManeuverData(maneuversData[props.maneuverID]);
    });

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Maneuvers Data...</div>
    } else {
        return (
            <div className="special-rule">
                <div className="special-rule-title">{maneuverData.name}</div><div>{maneuverData.text}</div>
            </div>
        );
    }
}

export default Maneuver;
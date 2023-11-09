import React, { useState, useEffect } from 'react';
import { IonText, IonLabel } from '@ionic/react';

import { maneuversData } from './data';

function Maneuver(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [maneuverData, setManeuverData] = useState({});

    useEffect(() => {
        setIsLoaded(true);
        setManeuverData(maneuversData[props.maneuverId]);
    });

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Maneuvers Data...</div>
    } else {
        return (
            <div>
                <IonText><IonLabel>{maneuverData.name}:</IonLabel>{maneuverData.text}</IonText>
            </div>
        );
    }
}

export default Maneuver;
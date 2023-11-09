import React, { useState, useEffect } from 'react';
import { IonText } from '@ionic/react';

import SpecialRuleList from './SpecialRuleList';

import { cortexesData } from './data'

function Cortex(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cortexData, setCortexData] = useState({});

    useEffect(() => {
        setIsLoaded(true);
        setCortexData(cortexesData[props.cortexId]);
    }, [props.cortexId]);

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Cortex Data...</div>
    } else {
        const { special_rules, name } = cortexData;
        return (
            <div>
                <IonText color="primary"><h3>Cortex:</h3></IonText>
                <IonText color="primary"><h3>{name}</h3></IonText>
                {special_rules && <SpecialRuleList special_rules={special_rules}/>}
            </div>
        );
    }
}

export default Cortex;
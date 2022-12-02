import React, { useState, useEffect } from 'react';

import SpecialRuleList from './SpecialRuleList';

function Cortex(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cortexData, setCortexData] = useState({});

    useEffect(() => {
        const cortexPath = `data/cortexes/${props.cortexID}.json`;
        fetch(cortexPath)
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setCortexData(result);
                }, 
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [props.cortexID]);

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Cortex Data...</div>
    } else {
        const { special_rules, name } = cortexData;
        return (
            <div>
                <h2>CORTEX</h2>
                <h2>{name}</h2>
                {special_rules && <SpecialRuleList special_rules={special_rules}/>}
            </div>
        );
    }
}

export default Cortex;
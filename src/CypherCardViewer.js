import React, { useState, useEffect } from 'react';

import { cyphersData } from './data'

function CypherCardViewer(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cypherData, setCypherData] = useState({});

    useEffect(() => {
        setIsLoaded(true);
        setCypherData(cyphersData[props.cypherID]);
    }, [props.cypherID]);

    function Cypher(props) {
        const { name, factions, type, text } = props;
        return <div>
            <h1>{name}</h1>
            <h1>{factions}</h1>
            <h1>{type}</h1>
            <div>{text}</div>
        </div>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Card Data...</div>
    } else {
        return (
            <div>
                <Cypher name={cypherData.name} factions={cypherData.factions} type={cypherData.type} text={cypherData.text}/>
            </div>
        );
    }
}

export default CypherCardViewer;
import React, { useState, useEffect } from 'react';
import {useParams} from "react-router-dom";

import { cyphersData, cypherTypesData, factionsData } from './data'

function CypherCardViewer(props) {
    const params = useParams();

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cypherData, setCypherData] = useState({});

    const cypherId = props.cypherId ? props.cypherId : params.cypherId;

    useEffect(() => {
        setIsLoaded(true);
        setCypherData(cyphersData[cypherId]);
    }, [cypherId]);

    function Cypher(props) {
        const { name, factions, type, pow, text } = props;
        return <div className="card-container">
            <h1>{name}</h1>
            <h1>{factions && factionsData[factions].name}</h1>
            <h1>{type && cypherTypesData[type].name}</h1>
            {pow && <h1><div>POW:</div> <div>{pow}</div></h1>}
            <div>{text}</div>
        </div>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Card Data...</div>
    } else {
        return (
            <div className="container">
                <Cypher name={cypherData.name} factions={cypherData.factions} type={cypherData.type} pow={cypherData.pow} text={cypherData.text}/>
            </div>
        );
    }
}

export default CypherCardViewer;
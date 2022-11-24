import React, { useState, useEffect } from 'react';

function CypherCardViewer(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cypherData, setCypherData] = useState({});

    useEffect(() => {
        const cardPath = `data/cyphers/${props.cypherID}.json`;
        fetch(cardPath)
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setCypherData(result);
                }, 
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
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
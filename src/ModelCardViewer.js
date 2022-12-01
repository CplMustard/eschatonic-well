import React, { useState, useEffect } from 'react';

import WeaponList from './WeaponList'
import HardPointList from './HardPointList'
import SpecialRuleList from './SpecialRuleList'

function ModelCardViewer(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cardData, setCardData] = useState({});

    const [hardPointOptions, setHardPointOptions] = useState([]);

    useEffect(() => {
        const cardPath = `data/models/${props.modelID}.json`;
        fetch(cardPath)
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setCardData(result);
                }, 
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [props.modelID]);

    function CardHeader(props) {
        const { name, type, factions } = props;
        return <div>
            <h1>{name}</h1>
            <h1>{factions}</h1>
            <h1>{type}</h1>
        </div>
    }

    function Statline(props) {
        const { spd, str, mat, rat, def, arm, foc, base_size, dc, boxes } = props.stats;
        return <div>
            {spd && <><div>SPD</div><div>{spd}</div></>}
            {str && <><div>STR</div><div>{str}</div></>}
            {mat && <><div>MAT</div><div>{mat}</div></>}
            {rat && <><div>RAT</div><div>{rat}</div></>}
            {def && <><div>DEF</div><div>{def}</div></>}
            {arm && <><div>ARM</div><div>{arm}</div></>}
            {foc && <><div>FOC</div><div>{foc}</div></>}
            {base_size && <><div>BASE SIZE</div><div>{base_size}</div></>}
            {dc && <><div>DC</div><div>{dc}</div></>}
            {boxes && <><div>BOXES</div><div>{boxes}</div></>}
        </div>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Card Data...</div>
    } else {
        if(hardPointOptions.length === 0) {
            const defaultHardPoints = []
            cardData.hard_points.forEach((hard_point) => defaultHardPoints.push(hard_point.options[0]));
            setHardPointOptions(defaultHardPoints);
        }
        const allWeapons = cardData.weapons.concat(hardPointOptions);
        return (
            <div>
                <CardHeader name={cardData.name} type={cardData.type} factions={cardData.factions} />
                <Statline stats={cardData.stats} />
                {cardData.hard_points && <HardPointList hard_points={cardData.hard_points} hardPointOptions={hardPointOptions} onChangeHardPointOptions={setHardPointOptions.bind(this)}/>}
                {allWeapons && <WeaponList weapons={allWeapons} />}
                {cardData.advantages && <SpecialRuleList special_rules={cardData.advantages} header={'Advantages'} />}
                {cardData.special_rules && <SpecialRuleList special_rules={cardData.special_rules} header={'Special Rules'}/>}
            </div>
        );
    }
}

export default ModelCardViewer;
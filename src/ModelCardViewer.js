import React, { useState, useEffect } from 'react';

import './App.css';

import Cortex from './Cortex';
import HardPointList from './HardPointList';
import SpecialRuleList from './SpecialRuleList';
import WeaponList from './WeaponList';

import models from './data/models'

function ModelCardViewer(props) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cardData, setCardData] = useState({});

    const [hardPointOptions, setHardPointOptions] = useState([]);

    useEffect(() => {
        setIsLoaded(true);
        setCardData(models[props.modelID]);
    }, [props.modelID]);

    function updateHardPoint(option, type, hardPointIndex) {
        const newHardPointOptions = [...hardPointOptions.slice(0, hardPointIndex), {type: type, option: option}, ...hardPointOptions.slice(hardPointIndex+1)];
        setHardPointOptions(newHardPointOptions);
    }

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
        return <div className={"statline"}>
            {spd && <div className={"statline-entry"}><div>SPD</div><div>{spd}</div></div>}
            {str && <div className={"statline-entry"}><div>STR</div><div>{str}</div></div>}
            {mat && <div className={"statline-entry"}><div>MAT</div><div>{mat}</div></div>}
            {rat && <div className={"statline-entry"}><div>RAT</div><div>{rat}</div></div>}
            {def && <div className={"statline-entry"}><div>DEF</div><div>{def}</div></div>}
            {arm && <div className={"statline-entry"}><div>ARM</div><div>{arm}</div></div>}
            {foc && <div className={"statline-entry"}><div>FOC</div><div>{foc}</div></div>}
            {base_size && <div className={"statline-entry"}><div>BASE SIZE</div><div>{base_size}</div></div>}
            {dc && <div className={"statline-entry"}><div>DC</div><div>{dc}</div></div>}
            {boxes && <div className={"statline-entry"}><div>BOXES</div><div>{boxes}</div></div>}
        </div>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Card Data...</div>
    } else {
        const { name, type, factions, stats, weapons, hard_points, advantages, special_rules } = cardData;

        if(hard_points && hardPointOptions.length === 0) {
            const defaultHardPoints = []
            hard_points.forEach((hard_point) => defaultHardPoints.push({type: hard_point.type, option: hard_point.options[0]}));
            setHardPointOptions(defaultHardPoints);
        }
        const hardPointWeaponOptions = hard_points ? hardPointOptions.filter((hardPointOption) => hardPointOption.type === "weapon").map((hardPointOption) => hardPointOption.option) : undefined;
        const hardPointCortexOption = hard_points ? hardPointOptions.filter((hardPointOption) => hardPointOption.type === "cortex").map((hardPointOption) => hardPointOption.option) : undefined;
        const allWeapons = hard_points ? weapons.concat(hardPointWeaponOptions) : weapons;

        return (
            <div>
                <CardHeader name={name} type={type} factions={factions} />
                <Statline stats={stats} />
                {hard_points && <HardPointList hard_points={hard_points} hardPointOptions={hardPointOptions} onChangeHardPoint={updateHardPoint.bind(this)}/>}
                {allWeapons && <WeaponList weapons={allWeapons} />}
                {advantages && <SpecialRuleList special_rules={advantages} header={'Advantages'} />}
                {hardPointCortexOption && <Cortex cortexID={hardPointCortexOption}/>}
                {special_rules && <SpecialRuleList special_rules={special_rules} header={'Special Rules'}/>}
            </div>
        );
    }
}

export default ModelCardViewer;
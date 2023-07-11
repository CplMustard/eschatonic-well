import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import './App.css';

import CardList from './CardList';
import Cortex from './Cortex';
import HardPointList from './HardPointList';
import SpecialRuleList from './SpecialRuleList';
import WeaponList from './WeaponList';

import { modelsData, weaponsData, factionsData, cadresData } from './data'

function ModelCardViewer(props) {
    const params = useParams();
    const navigate  = useNavigate();

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cardData, setCardData] = useState({});

    const [hardPointOptions, setHardPointOptions] = useState([]);

    const modelID = props.modelID ? props.modelID : params.modelID;

    useEffect(() => {
        setIsLoaded(true);
        setCardData(modelsData[modelID]);
    }, [modelID]);

    function openModelCard(id) {
        navigate(`/model/${id}`);
    }

    function updateHardPoint(option, type, point_cost, hardPointIndex) {
        const newHardPointOptions = [...hardPointOptions.slice(0, hardPointIndex), {type: type, option: option, point_cost: point_cost}, ...hardPointOptions.slice(hardPointIndex+1)];
        setHardPointOptions(newHardPointOptions);
    }

    function CardHeader(props) {
        const { name, type, subtypes, factions } = props;
        const factionNames = [];
        factions.forEach((faction) => factionNames.push(factionsData[faction].name))
        return <div>
            <h1>{name}</h1>
            <h1>{factionNames.join(", ")}</h1>
            {subtypes && <h1>{subtypes.join(", ")}</h1>}
            <h1>{type}</h1>
        </div>
    }

    function Statline(props) {
        const { spd, str, mat, rat, def, arm, foc, base_size, squad_size, dc, boxes } = props.stats;
        return <div className={"statline"}>
            {spd && <div className={"statline-entry"}><div>SPD</div><div>{spd}</div></div>}
            {str && <div className={"statline-entry"}><div>STR</div><div>{str}</div></div>}
            {mat && <div className={"statline-entry"}><div>MAT</div><div>{mat}</div></div>}
            {rat && <div className={"statline-entry"}><div>RAT</div><div>{rat}</div></div>}
            {def && <div className={"statline-entry"}><div>DEF</div><div>{def}</div></div>}
            {arm && <div className={"statline-entry"}><div>ARM</div><div>{arm}</div></div>}
            {foc && <div className={"statline-entry"}><div>FOC</div><div>{foc}</div></div>}
            {base_size && <div className={"statline-entry"}><div>BASE SIZE</div><div>{base_size}</div></div>}
            {squad_size && <div className={"statline-entry"}><div>SQUAD SIZE</div><div>{squad_size}</div></div>}
            {dc && <div className={"statline-entry"}><div>DC</div><div>{dc}</div></div>}
            {boxes && <div className={"statline-entry"}><div>BOXES</div><div>{boxes}</div></div>}
        </div>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Card Data...</div>
    } else {
        const { name, type, subtypes, cadre, weapon_points, factions, stats, weapons, hard_points, advantages, special_rules, attachments } = cardData;

        if(hard_points && hardPointOptions.length === 0) {
            const defaultHardPoints = [];
            hard_points.forEach((hard_point) => {
                defaultHardPoints.push({type: hard_point.type, option: hard_point.options[0], point_cost: hard_point.type === "weapon" ? weaponsData[hard_point.options[0]].point_cost : 0})
            }, [weaponsData]);
            setHardPointOptions(defaultHardPoints);
        }
        const hardPointWeaponOptions = hard_points ? hardPointOptions.filter((hardPointOption) => hardPointOption.type === "weapon").map((hardPointOption) => hardPointOption.option) : undefined;
        const hardPointCortexOption = hard_points ? hardPointOptions.filter((hardPointOption) => hardPointOption.type === "cortex").map((hardPointOption) => hardPointOption.option) : undefined;
        const allWeapons = hard_points ? weapons.concat(hardPointWeaponOptions) : weapons;
        const weaponPointCost = hard_points ? hardPointOptions.reduce((totalPointCost, option) => totalPointCost + option.point_cost, 0) : undefined
        const attachmentCardData = attachments ? attachments.map((attachment) => modelsData[attachment]) : undefined;
        let all_special_rules = special_rules ? special_rules : [];
        if(cadre) {
            all_special_rules = ["cadre|" + cadresData[cadre].name].concat(all_special_rules);
        }
        if(type === "void_gate") {
            all_special_rules = ["void_gate"].concat(all_special_rules);
        }
        if(type === "mantlet") {
            all_special_rules = ["mantlet"].concat(all_special_rules);
        }

        return (
            <div>
                <CardHeader name={name} type={type} subtypes={subtypes} factions={factions} />
                <Statline stats={stats} />
                {hard_points && <HardPointList hard_points={hard_points} hardPointOptions={hardPointOptions} onChangeHardPoint={updateHardPoint.bind(this)}/>}
                {weapon_points && <h3>Weapon Points: {weaponPointCost}/{weapon_points}</h3>}
                {allWeapons && <WeaponList weapons={allWeapons} />}
                {advantages && <SpecialRuleList special_rules={advantages} header={'Advantages'} />}
                {hardPointCortexOption && <Cortex cortexID={hardPointCortexOption}/>}
                {all_special_rules && <SpecialRuleList special_rules={all_special_rules} header={'Special Rules'}/>}
                {attachmentCardData && <CardList cards={attachmentCardData} header={"Attachments"} handleCardClicked={openModelCard}/>}
            </div>
        );
    }
}

export default ModelCardViewer;
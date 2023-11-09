import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IonText, IonGrid, IonCol, IonRow } from '@ionic/react';

import './App.css';

import CardList from './CardList';
import Cortex from './Cortex';
import HardPointList from './HardPointList';
import SpecialRuleList from './SpecialRuleList';
import WeaponList from './WeaponList';
import ManeuverList from './ManeuverList';

import { modelsData, modelTypesData, weaponsData, factionsData, cadresData } from './data'

function ModelCardViewer(props) {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [cardData, setCardData] = useState({});

    const [hardPointOptions, setHardPointOptions] = useState([]);

    const modelId = props.modelId ? props.modelId : params.modelId;

    useEffect(() => {
        setIsLoaded(true);
        setCardData(modelsData[modelId]);

        if(location.state && location.state.entryId) {
            const saved = localStorage.getItem("forceModelsData");
            const forceModelsData = JSON.parse(saved);
            const entry = forceModelsData.find((entry) => entry.id === location.state.entryId);
            if(entry && entry.hardPointOptions) {
                setHardPointOptions(entry.hardPointOptions);
            }
        }
    }, [modelId]);

    function openModelCard(id) {
        navigate(`/model/${id}`);
    }

    function updateHardPoint(option, type, point_cost, hardPointIndex) {
        const newHardPointOptions = [...hardPointOptions.slice(0, hardPointIndex), {type: type, option: option, point_cost: point_cost}, ...hardPointOptions.slice(hardPointIndex+1)];
        if(location.state.entryId) {
            const saved = localStorage.getItem("forceModelsData");
            let newForceModelsData = JSON.parse(saved);
            newForceModelsData.find((entry) => entry.id === location.state.entryId).hardPointOptions = newHardPointOptions;
            localStorage.setItem("forceModelsData", JSON.stringify(newForceModelsData));
        }
        setHardPointOptions(newHardPointOptions);
    }

    function CardHeader(props) {
        const { name, type, subtypes, factions } = props;
        const factionNames = [];
        const subtypeNames = [];
        factions.forEach((faction) => factionNames.push(factionsData[faction].name))
        if(subtypes) {
            subtypes.forEach((subtype) => subtypeNames.push(modelTypesData[subtype].name))
        }
        return <div>
            <IonText color="primary"><h1>{name}</h1></IonText>
            <IonText color="primary"><h1>{factionNames.join(", ")}</h1></IonText>
            <IonText color="primary"><h1>{subtypeNames.join(", ")}</h1></IonText>
            <IonText color="primary"><h1>{modelTypesData[type].name}</h1></IonText>
        </div>
    }

    function Statline(props) {
        const { spd, str, mat, rat, def, arm, foc, base_size, squad_size, dc, boxes } = props.stats;
        return <IonGrid fixed="true">
            <IonRow class="ion-justify-content-start">
                {spd && <IonCol><IonText><div>SPD</div><div>{spd}</div></IonText></IonCol>}
                {str && <IonCol><IonText><div>STR</div><div>{str}</div></IonText></IonCol>}
                {mat && <IonCol><IonText><div>MAT</div><div>{mat}</div></IonText></IonCol>}
                {rat && <IonCol><IonText><div>RAT</div><div>{rat}</div></IonText></IonCol>}
                {def && <IonCol><IonText><div>DEF</div><div>{def}</div></IonText></IonCol>}
                {arm && <IonCol><IonText><div>ARM</div><div>{arm}</div></IonText></IonCol>}
                {foc && <IonCol><IonText><div>FOC</div><div>{foc}</div></IonText></IonCol>}
                {base_size && <IonCol><IonText><div>BASE SIZE</div><div>{base_size}</div></IonText></IonCol>}
                {squad_size && <IonCol><IonText><div>SQUAD SIZE</div><div>{squad_size}</div></IonText></IonCol>}
                {dc && <IonCol><IonText><div>DC</div><div>{dc}</div></IonText></IonCol>}
                {boxes && <IonCol><IonText><div>BOXES</div><div>{boxes}</div></IonText></IonCol>}
            </IonRow>
        </IonGrid>
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading Card Data...</div>
    } else {
        const { name, type, subtypes, cadre, weapon_points, factions, stats, weapons, hard_points, advantages, special_rules, maneuvers, attachments } = cardData;

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
            <div className="container">
                <CardHeader name={name} type={type} subtypes={subtypes} factions={factions} />
                <Statline stats={stats} />
                {hard_points && <HardPointList hard_points={hard_points} hardPointOptions={hardPointOptions} onChangeHardPoint={updateHardPoint.bind(this)}/>}
                {weapon_points && <IonText color={weaponPointCost > weapon_points ? "danger" : "primary"}><h3>Weapon Points: {weaponPointCost}/{weapon_points}</h3></IonText>}
                {allWeapons && <WeaponList weapons={allWeapons} />}
                {advantages && <SpecialRuleList special_rules={advantages} header={'Advantages'} />}
                {hardPointCortexOption && hardPointCortexOption.length !== 0 && <Cortex cortexId={hardPointCortexOption}/>}
                {all_special_rules && <SpecialRuleList special_rules={all_special_rules} header={'Special Rules'}/>}
                {maneuvers && <ManeuverList maneuvers={maneuvers} header={'Maneuvers'}/>}
                {attachmentCardData && <CardList cards={attachmentCardData} header={"Attachments"} handleCardClicked={openModelCard}/>}
            </div>
        );
    }
}

export default ModelCardViewer;
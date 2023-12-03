import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { IonText, IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/react';

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
            const saved = localStorage.getItem(location.state.isSpecialIssue ? "specialIssueModelsData" : "forceModelsData");
            const modelsData = JSON.parse(saved);
            const entry = modelsData.find((entry) => entry.id === location.state.entryId);
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
        if(location.state && location.state.entryId) {
            const saved = localStorage.getItem(location.state.isSpecialIssue ? "specialIssueModelsData" : "forceModelsData");
            let newModelsData = JSON.parse(saved);
            newModelsData.find((entry) => entry.id === location.state.entryId).hardPointOptions = newHardPointOptions;
            localStorage.setItem(location.state.isSpecialIssue ? "specialIssueModelsData" : "forceModelsData", JSON.stringify(newModelsData));
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
        return <IonCardHeader>
            <IonCardTitle color="primary"><h1>{name}</h1></IonCardTitle>
            <IonCardSubtitle>
                <IonText color="primary"><h1>{factionNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{subtypeNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{modelTypesData[type].name}</h1></IonText>
            </IonCardSubtitle>
        </IonCardHeader>
    }

    function Statline(props) {
        const { spd, str, mat, rat, def, arm, foc, base_size, squad_size, dc, boxes } = props.stats;
        return <IonGrid fixed="true">
            <IonRow class="ion-justify-content-start">
                {spd && <IonCol><IonText><h1>SPD</h1><h1>{spd}</h1></IonText></IonCol>}
                {str && <IonCol><IonText><h1>STR</h1><h1>{str}</h1></IonText></IonCol>}
                {mat && <IonCol><IonText><h1>MAT</h1><h1>{mat}</h1></IonText></IonCol>}
                {rat && <IonCol><IonText><h1>RAT</h1><h1>{rat}</h1></IonText></IonCol>}
                {def && <IonCol><IonText><h1>DEF</h1><h1>{def}</h1></IonText></IonCol>}
                {arm && <IonCol><IonText><h1>ARM</h1><h1>{arm}</h1></IonText></IonCol>}
                {foc && <IonCol><IonText><h1>FOC</h1><h1>{foc}</h1></IonText></IonCol>}
                {base_size && <IonCol><IonText><h1>BASE SIZE</h1><h1>{base_size}</h1></IonText></IonCol>}
                {squad_size && <IonCol><IonText><h1>SQUAD SIZE</h1><h1>{squad_size}</h1></IonText></IonCol>}
                {dc && <IonCol><IonText><h1>DC</h1><h1>{dc}</h1></IonText></IonCol>}
                {boxes && <IonCol><IonText><h1>BOXES</h1><h1>{boxes}</h1></IonText></IonCol>}
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
            <IonCard>
                <CardHeader name={name} type={type} subtypes={subtypes} factions={factions} />
                <IonCardContent>
                    <Statline stats={stats} />
                    {hard_points && <HardPointList hard_points={hard_points} hardPointOptions={hardPointOptions} weaponPoints={weapon_points} onChangeHardPoint={updateHardPoint.bind(this)}/>}
                    {allWeapons && <WeaponList weapons={allWeapons} />}
                    {advantages && <SpecialRuleList special_rules={advantages} header={'Advantages'} />}
                    {hardPointCortexOption && hardPointCortexOption.length !== 0 && <Cortex cortexId={hardPointCortexOption}/>}
                    {all_special_rules && <SpecialRuleList special_rules={all_special_rules} header={'Special Rules'}/>}
                    {maneuvers && <ManeuverList maneuvers={maneuvers} header={'Maneuvers'}/>}
                    {attachmentCardData && <CardList cards={attachmentCardData} header={"Attachments"} handleCardClicked={openModelCard}/>}
                </IonCardContent>
            </IonCard>
        );
    }
}

export default ModelCardViewer;
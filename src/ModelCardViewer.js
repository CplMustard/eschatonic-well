import React, { useState, useEffect } from 'react';
import { useLocation, useHistory, useParams } from "react-router-dom";
import { IonPage, IonContent, IonToolbar, IonButtons, IonTitle, IonBackButton, IonText, IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonHeader, IonCheckbox, IonIcon } from '@ionic/react';
import { skull, skullOutline } from 'ionicons/icons';

import CardList from './CardList';
import Cortex from './Cortex';
import HardPointList from './HardPointList';
import SpecialRuleList from './SpecialRuleList';
import WeaponList from './WeaponList';
import ManeuverList from './ManeuverList';

import { modelsData, modelTypesData, weaponsData, factionsData, cadresData } from './data'

function ModelCardViewer(props) {
    const params = useParams();
    const history = useHistory();
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
            const forceModelsData = JSON.parse(saved);
            const entry = forceModelsData.find((entry) => entry.id === location.state.entryId);
            if(entry && entry.hardPointOptions) {
                setHardPointOptions(entry.hardPointOptions);
            }
        }
    }, [modelId]);

    function openModelCard(id) {
        history.push(`/model/${id}`);
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
        const { name, type, subtypes, factions, dc, boxes, base_size, squad_size } = props;
        const factionNames = [];
        const subtypeNames = [];
        factions.forEach((faction) => factionNames.push(factionsData[faction].name))
        if(subtypes) {
            subtypes.forEach((subtype) => subtypeNames.push(modelTypesData[subtype].name))
        }
        return <IonCardHeader>
            <IonCardTitle color="primary"><h1 style={{margin: 0}}>{name}</h1></IonCardTitle>
            <IonCardSubtitle>
                <IonText color="primary"><h1>{factionNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{subtypeNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{modelTypesData[type].name}</h1></IonText>
                {dc && <IonText color="tertiary"><h2>Deployment Cost: {dc}</h2></IonText>}
                {base_size && <IonText color="tertiary"><h3>Base Size: {base_size}mm</h3></IonText>}
                {squad_size && <IonText color="tertiary"><h3>Squad Size: {squad_size}</h3></IonText>}
                {boxes && <HitBoxes boxes={boxes} squad_size={squad_size}></HitBoxes>}
            </IonCardSubtitle>
        </IonCardHeader>
    }

    function HitBoxes(props) {
        const { boxes, squad_size } = props
        return <IonText color="secondary">
            <h2>Boxes:</h2>
            {!isNaN(boxes)
                ? squad_size && !isNaN(squad_size) && Number(squad_size) > 1
                    ? [...Array(squad_size)].map((e, i) => <h2 key={i}>Model {i+1}: {[...Array(boxes)].map((e, i) => <IonIcon key={i} color="secondary" icon={skullOutline} size="large"></IonIcon>)}</h2>)
                    : [...Array(boxes)].map((e, i) => <IonIcon key={i} color="secondary" icon={skullOutline} size="large"></IonIcon>)
                : <h3>{boxes}</h3>
            }
        </IonText>;
    }

    function Statline(props) {
        const { spd, str, mat, rat, def, arm, foc } = props.stats;
        return <IonGrid>
            <IonRow class="ion-justify-content-start">
                {spd && <IonCol size="auto"><IonText color="secondary"><h1>SPD</h1><h1 className="statline-value">{spd}</h1></IonText></IonCol>}
                {str && <IonCol size="auto"><IonText color="secondary"><h1>STR</h1><h1 className="statline-value">{str}</h1></IonText></IonCol>}
                {mat && <IonCol size="auto"><IonText color="secondary"><h1>MAT</h1><h1 className="statline-value">{mat}</h1></IonText></IonCol>}
                {rat && <IonCol size="auto"><IonText color="secondary"><h1>RAT</h1><h1 className="statline-value">{rat}</h1></IonText></IonCol>}
                {def && <IonCol size="auto"><IonText color="secondary"><h1>DEF</h1><h1 className="statline-value">{def}</h1></IonText></IonCol>}
                {arm && <IonCol size="auto"><IonText color="secondary"><h1>ARM</h1><h1 className="statline-value">{arm}</h1></IonText></IonCol>}
                {foc && <IonCol size="auto"><IonText color="secondary"><h1>FOC</h1><h1 className="statline-value">{foc}</h1></IonText></IonCol>}
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
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton></IonBackButton>
                        </IonButtons>
                        <IonTitle>Back Button</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonCard>
                        <CardHeader name={name} type={type} subtypes={subtypes} factions={factions} dc={stats.dc} boxes={stats.boxes} base_size={stats.base_size} squad_size={stats.squad_size} /><hr/>
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
                </IonContent>
            </IonPage>
        );
    }
}

export default ModelCardViewer;
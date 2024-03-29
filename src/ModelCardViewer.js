import React, { useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
import { IonPage, IonContent, IonToolbar, IonButtons, IonTitle, IonBackButton, IonText, IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonHeader, IonIcon } from "@ionic/react";
import { skullOutline } from "ionicons/icons";

import CardList from "./CardList";
import Cortex from "./Cortex";
import HardPointList from "./HardPointList";
import SpecialRuleList from "./SpecialRuleList";
import WeaponList from "./WeaponList";
import ManeuverList from "./ManeuverList";

import { modelsData, modelTypesData, weaponsData, factionsData, cadresData } from "./data";

function ModelCardViewer(props) {
    const params = useParams();
    const history = useHistory();
    const location = useLocation();

    const [hardPointOptions, setHardPointOptions] = useState([]);

    const modelId = props.modelId ? props.modelId : params.modelId;
    
    const cardData = modelsData[modelId];

    useEffect(() => {
        if(location.state && location.state.entryId) {
            const key = location.state.isSpecialIssue ? "specialIssueModelsData" : "forceModelsData";
            const saved = sessionStorage.getItem(key);
            const forceModelsData = JSON.parse(saved);
            const entry = forceModelsData.find((entry) => entry.id === location.state.entryId);
            if(entry && entry.hardPointOptions) {
                setHardPointOptions(entry.hardPointOptions);
            }
        }
    }, [modelId, location.state]);

    function openModelCard(id) {
        history.push(`/model/${id}`);
    }

    function updateHardPoint(option, type, point_cost, hardPointIndex) {
        const newHardPointOptions = [...hardPointOptions.slice(0, hardPointIndex), {type: type, option: option, point_cost: point_cost}, ...hardPointOptions.slice(hardPointIndex+1)];
        if(location.state && location.state.entryId) {
            const key = location.state.isSpecialIssue ? "specialIssueModelsData" : "forceModelsData";
            const saved = sessionStorage.getItem(key);
            let newModelsData = JSON.parse(saved);
            newModelsData.find((entry) => entry.id === location.state.entryId).hardPointOptions = newHardPointOptions;
            sessionStorage.setItem(key, JSON.stringify(newModelsData));
        }
        setHardPointOptions(newHardPointOptions);
    }

    function CardHeader(props) {
        const { name, type, subtypes, factions, dc, boxes, base_size, squad_size } = props;
        const factionNames = [];
        const subtypeNames = [];
        factions.forEach((faction) => factionNames.push(factionsData[faction].name));
        if(subtypes) {
            subtypes.forEach((subtype) => subtypeNames.push(modelTypesData[subtype].name));
        }
        return <IonCardHeader>
            <IonCardTitle color="primary"><h1 style={{margin: 0}}>{name}</h1></IonCardTitle>
            <IonCardSubtitle>
                <IonText color="primary"><h1>{factionNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{subtypeNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{modelTypesData[type].name}</h1></IonText>
                {dc && <IonText color="secondary"><h2>Deployment Cost: {dc}</h2></IonText>}
                {base_size && <IonText color="secondary"><h3>Base Size: {base_size}{!isNaN(base_size) && "mm"}</h3></IonText>}
                {squad_size && <IonText color="secondary"><h3>Squad Size: {squad_size}</h3></IonText>}
                {boxes && <HitBoxes boxes={boxes} squad_size={squad_size}></HitBoxes>}
            </IonCardSubtitle>
        </IonCardHeader>;
    }

    function HitBoxes(props) {
        const { boxes, squad_size } = props;
        return <IonText color="primary">
            <h2>Boxes:</h2>
            {!isNaN(boxes)
                ? squad_size && !isNaN(squad_size) && Number(squad_size) > 1
                    ? [...Array(squad_size)].map((e, i) => <h2 key={i}>Model {i+1}: {[...Array(boxes)].map((e, i) => <IonIcon key={i} color="secondary" icon={skullOutline} size="large"></IonIcon>)}</h2>)
                    : [...Array(boxes)].map((e, i) => <IonIcon key={i} color="secondary" icon={skullOutline} size="large"></IonIcon>)
                : <IonText color="secondary"><h3>{boxes}</h3></IonText>
            }
        </IonText>;
    }

    function Statline(props) {
        const { spd, str, mat, rat, def, arm, foc } = props.stats;
        return <IonGrid class="statline">
            <IonRow>
                {spd && <IonCol size="auto" className="statline-entry"><IonText color="primary"><h2>SPD</h2></IonText><IonText color="secondary"><h1>{spd}</h1></IonText></IonCol>}
                {str && <IonCol size="auto" className="statline-entry"><IonText color="primary"><h2>STR</h2></IonText><IonText color="secondary"><h1>{str}</h1></IonText></IonCol>}
                {mat && <IonCol size="auto" className="statline-entry"><IonText color="primary"><h2>MAT</h2></IonText><IonText color="secondary"><h1>{mat}</h1></IonText></IonCol>}
                {rat && <IonCol size="auto" className="statline-entry"><IonText color="primary"><h2>RAT</h2></IonText><IonText color="secondary"><h1>{rat}</h1></IonText></IonCol>}
                {def && <IonCol size="auto" className="statline-entry"><IonText color="primary"><h2>DEF</h2></IonText><IonText color="secondary"><h1>{def}</h1></IonText></IonCol>}
                {arm && <IonCol size="auto" className="statline-entry"><IonText color="primary"><h2>ARM</h2></IonText><IonText color="secondary"><h1>{arm}</h1></IonText></IonCol>}
                {foc && <IonCol size="auto" className="statline-entry"><IonText color="primary"><h2>FOC</h2></IonText><IonText color="secondary"><h1>{foc}</h1></IonText></IonCol>}
            </IonRow>
        </IonGrid>; 
    }

    const { name, type, subtypes, cadre, weapon_points, factions, stats, weapons, hard_points, advantages, special_rules, maneuvers, attachments } = cardData;

    if(hard_points && hardPointOptions.length === 0) {
        const defaultHardPoints = [];
        hard_points.forEach((hard_point) => {
            defaultHardPoints.push({type: hard_point.type, option: hard_point.options[0], point_cost: hard_point.type === "weapon" ? weaponsData[hard_point.options[0]].point_cost : 0});
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
        <IonPage className={factions.length === 1 ? factions[0] : ""}>
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
                        {advantages && <SpecialRuleList special_rules={advantages} header={"Advantages"} />}
                        {hardPointCortexOption && hardPointCortexOption.length !== 0 && <Cortex cortexId={hardPointCortexOption}/>}
                        {all_special_rules && <SpecialRuleList special_rules={all_special_rules} header={"Special Rules"}/>}
                        {maneuvers && <ManeuverList maneuvers={maneuvers} header={"Maneuvers"}/>}
                        {attachmentCardData && <CardList cards={attachmentCardData} header={"Attachments"} handleCardClicked={openModelCard}/>}
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
}

export default ModelCardViewer;
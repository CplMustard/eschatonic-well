import React, { useState, useEffect } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
import { useSessionStorageState } from "ahooks";
import { IonPage, IonContent, IonLabel, IonIcon, IonToolbar, IonButtons, IonTitle, IonBackButton, IonText, IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonHeader } from "@ionic/react";
import { skullOutline } from "ionicons/icons";

import Cortex from "./Cortex";
import HardPointList from "./HardPointList";
import SpecialRuleList from "./SpecialRuleList";
import WeaponList from "./WeaponList";
import ManeuverList from "./ManeuverList";
import UnitStatus from "./UnitStatus";

import { modelsData, modelTypesData, weaponsData, factionsData, cadresData } from "./data";

function ModelCardViewer(props) {
    const params = useParams();
    const history = useHistory();
    const location = useLocation();

    const [hardPointOptions, setHardPointOptions] = useState([]);

    const [playSpecialIssueModelsData, setPlaySpecialIssueModelsData] = useSessionStorageState("playSpecialIssueModelsData", {defaultValue: [], listenStorageChange: true});
    const [playForceModelsData, setPlayForceModelsData] = useSessionStorageState("playForceModelsData", {defaultValue: [], listenStorageChange: true});

    const [specialIssueModelsData, setSpecialIssueModelsData] = useSessionStorageState("specialIssueModelsData", {defaultValue: [], listenStorageChange: true});
    const [forceModelsData, setForceModelsData] = useSessionStorageState("forceModelsData", {defaultValue: [], listenStorageChange: true});

    const [unitsStatus, setUnitsStatus] = useSessionStorageState("unitsStatus", {defaultValue: [], listenStorageChange: true});

    const isPlayMode = location.state && location.state.isPlayMode;
    const modelsDataState = location.state ? (isPlayMode? (location.state.isSpecialIssue ? playSpecialIssueModelsData : playForceModelsData) : (location.state.isSpecialIssue ? specialIssueModelsData : forceModelsData)) : [];
    const setModelsData = location.state ? (isPlayMode? (location.state.isSpecialIssue ? setPlaySpecialIssueModelsData : setPlayForceModelsData) : (location.state.isSpecialIssue ? setSpecialIssueModelsData : setForceModelsData)) : () => {};
    const entryId = location.state ? location.state.entryId : undefined;

    const modelId = props.modelId ? props.modelId : params.modelId;
    
    const cardData = modelsData[modelId];

    useEffect(() => {
        if(entryId) {
            const entry = modelsDataState.find((entry) => entry.id === entryId);
            if(entry && entry.hardPointOptions) {
                setHardPointOptions(entry.hardPointOptions);
            }
        }
    }, [modelId, location.state]);

    const getUnitStatusEntry = (entryId) => {
        if (entryId && isPlayMode) {
            if (unitsStatus) {
                return unitsStatus.find((entry) => entry.id === entryId);
            }
        } else {
            return undefined;
        }
    };

    function openModelCard(id) {
        history.push(`/model/${id}`);
    }

    function updateHardPoint(option, type, point_cost, hardPointIndex) {
        const newHardPointOptions = [...hardPointOptions.slice(0, hardPointIndex), {type: type, option: option, point_cost: point_cost}, ...hardPointOptions.slice(hardPointIndex+1)];
        if(entryId && !isPlayMode) {
            let newModelsData = modelsDataState;
            newModelsData.find((entry) => entry.id === entryId).hardPointOptions = newHardPointOptions;
            setModelsData(newModelsData);
        }
        setHardPointOptions(newHardPointOptions);
    }

    function setArc(id, arc) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        if(arc <= unitsStatus[index].arcLimit) {
            unitsStatus[index].arc = arc;
            setUnitsStatus(newUnitsStatus);
        }
    }

    function toggleActivation(id) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        unitsStatus[index].activated = !unitsStatus[index].activated;
        setUnitsStatus(newUnitsStatus);
    }

    function toggleContinuousEffect(id, modelIndex, attachmentId, effectId) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        const unitModels = attachmentId ? unitsStatus[index].attachments.find((entry) => entry.modelId === attachmentId).unitModels: unitsStatus[index].unitModels;
        const unitModel = unitModels[modelIndex];
        const continuousEffects = unitModel.continuousEffects;
        if(continuousEffects) {
            if(continuousEffects.includes(effectId)) {
                const effectIndex = continuousEffects.findIndex((id) => id === effectId);
                unitModel.continuousEffects = [...continuousEffects.slice(0, effectIndex), ...continuousEffects.slice(effectIndex + 1)];
            } else {
                continuousEffects.push(effectId);
            }
            setUnitsStatus(newUnitsStatus);
        }
    }

    function toggleDamageBox(id, modelIndex, attachmentId, boxIndex) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === id);
        const unitModels = attachmentId ? unitsStatus[index].attachments.find((entry) => entry.modelId === attachmentId).unitModels: unitsStatus[index].unitModels;
        const unitModel = unitModels[modelIndex];
        const boxes = unitModel.boxes;
        boxes[boxIndex] = !boxes[boxIndex];
        setUnitsStatus(newUnitsStatus);
    }

    function DummyUnitStatus(props) {
        const { squad_size, boxes } = props;
        const modelComponents = [];

        if( squad_size) {
            for (let i=0; i<squad_size; i++) {
                modelComponents.push(<div key={i}>
                    <IonLabel>{squad_size > 1 && `Model ${i+1}: `}</IonLabel>
                    <DummyHitBoxes boxes={boxes}></DummyHitBoxes>
                </div>);
            }
            return modelComponents;
        } else {
            return <DummyHitBoxes key={0} boxes={boxes}></DummyHitBoxes>;
        }
    }

    function DummyHitBoxes(props) {
        const { boxes } = props;
        return <IonText color="primary">
            <IonLabel>Boxes:</IonLabel>
            {[...Array(boxes)].map((e, i) => 
                <IonIcon 
                    key={i} 
                    color="tertiary" 
                    icon={skullOutline} 
                    size="large"
                ></IonIcon>
            )}
        </IonText>;
    }

    function CardHeader(props) {
        const { name, type, subtypes, factions, dc, boxes, base_size, squad_size, isAttachment } = props;
        const factionNames = [];
        const subtypeNames = [];
        const unitStatusEntry = getUnitStatusEntry(entryId);
        factions.forEach((faction) => factionNames.push(factionsData[faction].name));
        if(subtypes) {
            subtypes.forEach((subtype) => subtypeNames.push(modelTypesData[subtype].name));
        }
        return <IonCardHeader>
            <IonCardTitle color="primary"><h1 style={{margin: 0, fontWeight: "bolder"}}>{name}</h1></IonCardTitle>
            <IonCardSubtitle>
                <IonText color="primary"><h1>{factionNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{subtypeNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{modelTypesData[type].name}</h1></IonText>
                {dc && <IonText color="secondary"><h2>Deployment Cost: {dc}</h2></IonText>}
                {base_size && <IonText color="secondary"><h3>Base Size: {base_size}{!isNaN(base_size) && "mm"}</h3></IonText>}
                {squad_size && <IonText color="secondary"><h3>Squad Size: {squad_size}</h3></IonText>}
                {unitStatusEntry && !isAttachment && 
                    <UnitStatus 
                        id={entryId} 
                        entry={unitStatusEntry} 
                        boxes={boxes} 
                        isPlayMode={isPlayMode} 
                        collapsible={false}
                        setArc={setArc} 
                        toggleActivation={toggleActivation} 
                        toggleContinuousEffect={toggleContinuousEffect} 
                        toggleDamageBox={toggleDamageBox} 
                        handleCardClicked={openModelCard}
                    ></UnitStatus>
                }
                {!unitStatusEntry && boxes && <DummyUnitStatus squad_size={squad_size} boxes={boxes}></DummyUnitStatus>}
            </IonCardSubtitle>
        </IonCardHeader>;
    }

    function CardContent(props) {
        const { cardData, specialRules, weapons, hardPointCortexOption, isAttachment } = props;  
        const { name, type, subtypes, weapon_points, factions, stats, hard_points, advantages, maneuvers, attachments } = cardData;

        const unitStatusEntry = getUnitStatusEntry(entryId);
        const deployedAttachmentsData = unitStatusEntry ? unitStatusEntry.attachments : [];
        const deployedAttachmentIds = deployedAttachmentsData.length !== 0 ? deployedAttachmentsData.map((deployedAttachment) => deployedAttachment.modelId): attachments;
        const attachmentIds = attachments ? attachments.filter((attachmentId) => deployedAttachmentIds.includes(attachmentId)) : [];

        return (
            <IonCard>
                <CardHeader name={name} type={type} subtypes={subtypes} factions={factions} dc={stats.dc} boxes={stats.boxes} base_size={stats.base_size} squad_size={stats.squad_size} isAttachment={isAttachment}/><hr/>
                <IonCardContent>
                    <Statline stats={stats} />
                    {hard_points && <HardPointList hard_points={hard_points} hardPointOptions={hardPointOptions} weaponPoints={weapon_points} onChangeHardPoint={updateHardPoint.bind(this)} isPlayMode={isPlayMode}/>}
                    {weapons && <WeaponList weapons={weapons} />}
                    {advantages && <SpecialRuleList special_rules={advantages} header={"Advantages"} />}
                    {hardPointCortexOption && hardPointCortexOption.length !== 0 && <Cortex cortexId={hardPointCortexOption}/>}
                    {specialRules && <SpecialRuleList special_rules={specialRules} header={"Special Rules"}/>}
                    {maneuvers && <ManeuverList maneuvers={maneuvers} header={"Maneuvers"}/>}
                    {attachments && <AttachmentCards attachments={attachmentIds}/>}
                </IonCardContent>
            </IonCard>
        );
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

    function AttachmentCards(props) {
        const { attachments } = props;
        const attachmentCards = [];

        attachments.forEach((attachmentId, index) => {
            const attachmentCardData = modelsData[attachmentId];

            let all_special_rules = attachmentCardData.special_rules ? attachmentCardData.special_rules : [];
            if(attachmentCardData.cadre) {
                all_special_rules = ["cadre|" + cadresData[cadre].name].concat(all_special_rules);
            }

            attachmentCards.push(<CardContent key={index} cardData={attachmentCardData} weapons={attachmentCardData.weapons} specialRules={all_special_rules} isAttachment={true}/>);
        });
        return <>
            <IonText color="secondary"><h1 style={{margin: 0, fontWeight: "bolder"}}>Attachments</h1></IonText>
            {attachmentCards}
        </>;
    }

    const { type, cadre, factions, weapons, hard_points, special_rules, attachments } = cardData;

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
                <CardContent cardData={cardData} specialRules={all_special_rules} weapons={allWeapons} hardPointCortexOption={hardPointCortexOption} attachments={attachments}/>
            </IonContent>
        </IonPage>
    );
}

export default ModelCardViewer;
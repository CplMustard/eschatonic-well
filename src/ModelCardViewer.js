import React, { useEffect, useState } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
import { useSessionStorageState } from "ahooks";
import { IonButton, IonPage, IonContent, IonLabel, IonIcon, IonToolbar, IonButtons, IonBackButton, IonText, IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonHeader } from "@ionic/react";
import { skullOutline } from "ionicons/icons";

import { getHardPointOptions, getAllSpecialRules, getAllWeapons, collectChanges } from "./util/cardUtil";

import Cortex from "./Cortex";
import HardPointList from "./HardPointList";
import SpecialRuleList from "./SpecialRuleList";
import WeaponList from "./WeaponList";
import ManeuverList from "./ManeuverList";
import UnitStatus from "./UnitStatus";
import ViewChangesModal from "./modals/ViewChangesModal";
import VersionNumber from "./VersionNumber";

import { getCortexesData, getExpansionsData, getModelsData, getModelTypesData, getWeaponsData, getSpecialRulesData, getFactionsData, getCadresData, getManeuversData } from "./DataLoader";

function ModelCardViewer(props) {
    const params = useParams();
    const history = useHistory();
    const location = useLocation();

    const [hardPointOptions, setHardPointOptions] = useState([]);
    const [isHardpointDropdownOpen, setIsHardpointDropdownOpen] = useState(false);

    const [playSpecialIssueModelsData, setPlaySpecialIssueModelsData] = useSessionStorageState("playSpecialIssueModelsData", {defaultValue: [], listenStorageChange: true});
    const [playForceModelsData, setPlayForceModelsData] = useSessionStorageState("playForceModelsData", {defaultValue: [], listenStorageChange: true});

    const [specialIssueModelsData, setSpecialIssueModelsData] = useSessionStorageState("specialIssueModelsData", {defaultValue: [], listenStorageChange: true});
    const [forceModelsData, setForceModelsData] = useSessionStorageState("forceModelsData", {defaultValue: [], listenStorageChange: true});

    const [unitsStatus, setUnitsStatus] = useSessionStorageState("unitsStatus", {defaultValue: [], listenStorageChange: true});

    const rulesetId = props.rulesetId ? props.rulesetId : location.state && location.state.rulesetId;

    const isPlayMode = location.state && location.state.isPlayMode;
    const modelsDataState = location.state ? (isPlayMode? (location.state.isSpecialIssue ? playSpecialIssueModelsData : playForceModelsData) : (location.state.isSpecialIssue ? specialIssueModelsData : forceModelsData)) : [];
    const setModelsData = location.state ? (isPlayMode? (location.state.isSpecialIssue ? setPlaySpecialIssueModelsData : setPlayForceModelsData) : (location.state.isSpecialIssue ? setSpecialIssueModelsData : setForceModelsData)) : () => {};
    const entryId = location.state ? location.state.entryId : undefined;

    const cortexesData = getCortexesData(rulesetId);
    const modelsData = getModelsData(rulesetId);
    const modelTypesData = getModelTypesData(rulesetId);
    const weaponsData = getWeaponsData(rulesetId);
    const specialRulesData = getSpecialRulesData(rulesetId);
    const expansionsData = getExpansionsData(rulesetId);
    const factionsData = getFactionsData(rulesetId);
    const cadresData = getCadresData(rulesetId);
    const maneuversData = getManeuversData(rulesetId);

    const modelId = props.modelId ? props.modelId : params.modelId;

    const cardData = modelsData[modelId];

    const totalArc = 7;
    const arcInWell = unitsStatus.reduce((currentArc, unitStatus) => currentArc - (unitStatus.arc ? unitStatus.arc : 0), totalArc);

    const context = {
        cadresData: cadresData,
        cortexesData: cortexesData,
        specialRulesData: specialRulesData,
        maneuversData: maneuversData,
        weaponsData: weaponsData
    };

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

    function openModelCard(card) {
        const modelId = card.id;
        history.push(`/model/${modelId}`, { rulesetId: rulesetId });
    }

    function updateHardPoint(option, type, point_cost, hardPointIndex) {
        const newHardPointOptions = [...hardPointOptions.slice(0, hardPointIndex), {type: type, option: option, point_cost: point_cost}, ...hardPointOptions.slice(hardPointIndex+1)];
        if(entryId && !isPlayMode) {
            let newModelsData = modelsDataState;
            newModelsData.find((entry) => entry.id === entryId).hardPointOptions = newHardPointOptions;
            setModelsData(newModelsData);
        }
        setHardPointOptions(newHardPointOptions);
        setIsHardpointDropdownOpen(true);
    }

    function setArc(entryId, arc) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === entryId);
        if(arc <= unitsStatus[index].arcLimit) {
            unitsStatus[index].arc = arc;
            setUnitsStatus(newUnitsStatus);
        }
    }

    function toggleActivation(entryId) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === entryId);
        unitsStatus[index].activated = !unitsStatus[index].activated;
        setUnitsStatus(newUnitsStatus);
    }

    function toggleContinuousEffect(entryId, modelIndex, attachmentId, newEffectId) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === entryId);
        const unitModels = attachmentId ? unitsStatus[index].attachments.find((entry) => entry.modelId === attachmentId).unitModels: unitsStatus[index].unitModels;
        const unitModel = unitModels[modelIndex];
        const continuousEffects = unitModel.continuousEffects;
        if(continuousEffects) {
            if(continuousEffects.includes(newEffectId)) {
                const effectIndex = continuousEffects.findIndex((effectId) => effectId === newEffectId);
                unitModel.continuousEffects = [...continuousEffects.slice(0, effectIndex), ...continuousEffects.slice(effectIndex + 1)];
            } else {
                continuousEffects.push(newEffectId);
            }
            setUnitsStatus(newUnitsStatus);
        }
    }

    function toggleDamageBox(entryId, modelIndex, attachmentId, boxIndex) {
        let newUnitsStatus = unitsStatus;

        const index = newUnitsStatus.findIndex((entry) => entry.id === entryId);
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
                    {Number(boxes) ? <DummyHitBoxes boxes={boxes}></DummyHitBoxes> : <><IonText color="primary"><IonLabel>Boxes: </IonLabel><h3>{boxes}</h3></IonText></>}
                </div>);
            }
            return modelComponents;
        } else {
            return Number(boxes) ? <DummyHitBoxes key={0} boxes={boxes}></DummyHitBoxes> : <IonText color="primary"><IonLabel>Boxes: </IonLabel><h3>{boxes}</h3></IonText>;
        }
    }

    function DummyHitBoxes(props) {
        const { boxes } = props;
        return <IonText color="primary">
            <IonLabel>Boxes:</IonLabel>
            <h3 style={{margin: 0}}>
            {[...Array(boxes)].map((e, i) => 
                <IonIcon 
                    key={i} 
                    color="tertiary" 
                    icon={skullOutline} 
                    size="large"
                ></IonIcon>
            )}
            </h3>
        </IonText>;
    }

    function CardHeader(props) {
        const { rulesetId, cardData, isAttachment } = props;
        const { name, type, subtypes, factions, expansion, stats } = cardData;
        const { dc, base_size, squad_size, boxes } = stats;
        const factionNames = [];
        const subtypeNames = [];
        const unitStatusEntry = getUnitStatusEntry(entryId);

        factions.forEach((faction) => factionNames.push(factionsData[faction].name));
        if(subtypes) {
            subtypes.forEach((subtype) => subtypeNames.push(modelTypesData[subtype].name));
        }

        const [isViewChangesModalOpen, setIsViewChangesModalOpen] = useState(false);

        const collectedChanges = collectChanges(context, cardData);

        return <IonCardHeader>
            <ViewChangesModal isOpen={isViewChangesModalOpen} setIsOpen={setIsViewChangesModalOpen} changeEntries={collectedChanges}></ViewChangesModal>
            <IonCardTitle color="primary"><h1 style={{margin: 0, fontWeight: "bolder"}}>{name}</h1></IonCardTitle>
            {collectedChanges.length !== 0 && <IonButton onClick={() => {setIsViewChangesModalOpen(true);}}>CHANGES</IonButton>}
            <IonCardSubtitle>
                <IonText color="primary"><h3>{`Expansion: ${expansionsData[expansion].name}`}</h3></IonText>
                <IonText color="primary"><h1>{factionNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{subtypeNames.join(", ")}</h1></IonText>
                <IonText color="primary"><h1>{modelTypesData[type].name}</h1></IonText>
                {dc && <IonText color="secondary"><h2>Deployment Cost: {dc}</h2></IonText>}
                {base_size && <IonText color="secondary"><h3>Base Size: {base_size}{!isNaN(base_size) && "mm"}</h3></IonText>}
                {squad_size && <IonText color="secondary"><h3>Squad Size: {squad_size}</h3></IonText>}
                {unitStatusEntry && !isAttachment && 
                    <UnitStatus 
                        rulesetId={rulesetId} 
                        id={entryId} 
                        entry={unitStatusEntry} 
                        boxes={boxes} 
                        isPlayMode={isPlayMode} 
                        collapsible={false}
                        arcInWell={arcInWell}
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
        const { rulesetId, cardData, specialRules, weapons, hardPointCortexOption, isAttachment } = props;  
        const { weapon_points, stats, hard_points, advantages, maneuvers, attachments } = cardData;

        const unitStatusEntry = getUnitStatusEntry(entryId);
        const deployedAttachmentsData = unitStatusEntry ? unitStatusEntry.attachments : [];
        const deployedAttachmentIds = deployedAttachmentsData.length !== 0 ? deployedAttachmentsData.map((deployedAttachment) => deployedAttachment.modelId): attachments;
        const attachmentIds = attachments ? attachments.filter((attachmentId) => deployedAttachmentIds.includes(attachmentId)) : [];

        return (
            <IonCard>
                <CardHeader rulesetId={rulesetId} cardData={cardData} isAttachment={isAttachment}/><hr/>
                <IonCardContent>
                    <Statline stats={stats} />
                    {hard_points && <HardPointList 
                        rulesetId={rulesetId} 
                        hard_points={hard_points} 
                        hardPointOptions={hardPointOptions} 
                        weaponPoints={weapon_points} 
                        isDropdownOpen={isHardpointDropdownOpen}
                        onClick={() => setIsHardpointDropdownOpen(!isHardpointDropdownOpen)}
                        onChangeHardPoint={(option, type, point_cost, hardPointIndex) => updateHardPoint(option, type, point_cost, hardPointIndex)} 
                        isPlayMode={isPlayMode}
                    />}
                    {weapons && <WeaponList rulesetId={rulesetId} weapons={weapons} />}
                    {advantages && <SpecialRuleList rulesetId={rulesetId} special_rules={advantages} header={"Advantages"} />}
                    {hardPointCortexOption && hardPointCortexOption.length !== 0 && <Cortex rulesetId={rulesetId} cortexId={hardPointCortexOption}/>}
                    {specialRules && <SpecialRuleList rulesetId={rulesetId} special_rules={specialRules} header={"Special Rules"}/>}
                    {maneuvers && <ManeuverList rulesetId={rulesetId} maneuvers={maneuvers} header={"Maneuvers"}/>}
                    {attachments && <AttachmentCards rulesetId={rulesetId} attachments={attachmentIds}/>}
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

            const all_special_rules = getAllSpecialRules(cadresData, attachmentCardData.special_rules, attachmentCardData.cadre, attachmentCardData.type);

            attachmentCards.push(<CardContent rulesetId={rulesetId} key={index} cardData={attachmentCardData} weapons={attachmentCardData.weapons} specialRules={all_special_rules} isAttachment={true}/>);
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
    const hardPointWeaponOptions = getHardPointOptions(hard_points, hardPointOptions, "weapon");
    const hardPointCortexOption = getHardPointOptions(hard_points, hardPointOptions, "cortex");
    const allWeapons = getAllWeapons(hard_points, weapons, hardPointWeaponOptions);
    const all_special_rules = getAllSpecialRules(cadresData, special_rules, cadre, type);

    return (
        <IonPage className={factions.length === 1 ? factions[0] : ""}>
            <IonHeader>
                <VersionNumber/>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton></IonBackButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <CardContent rulesetId={rulesetId} cardData={cardData} specialRules={all_special_rules} weapons={allWeapons} hardPointCortexOption={hardPointCortexOption} attachments={attachments}/>
            </IonContent>
        </IonPage>
    );
}

export default ModelCardViewer;
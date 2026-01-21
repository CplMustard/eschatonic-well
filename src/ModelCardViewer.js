import React, { useEffect, useState } from "react";
import { useLocation, useHistory, useParams } from "react-router-dom";
import { useSessionStorageState } from "ahooks";
import { IonButton, IonPage, IonContent, IonLabel, IonIcon, IonToolbar, IonButtons, IonTitle, IonBackButton, IonText, IonGrid, IonCol, IonRow, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonHeader } from "@ionic/react";
import { skullOutline } from "ionicons/icons";

import Cortex from "./Cortex";
import HardPointList from "./HardPointList";
import SpecialRuleList from "./SpecialRuleList";
import WeaponList from "./WeaponList";
import ManeuverList from "./ManeuverList";
import UnitStatus from "./UnitStatus";
import ViewChangesModal from "./ViewChangesModal";

import { getCortexesData, getModelsData, getModelTypesData, getWeaponsData, getSpecialRulesData, getFactionsData, getCadresData, getManeuversData } from "./DataLoader";

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
    const factionsData = getFactionsData(rulesetId);
    const cadresData = getCadresData(rulesetId);
    const maneuversData = getManeuversData(rulesetId);

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
        history.push(`/model/${id}`, { rulesetId: rulesetId });
    }

    function getHardPointOptions(hard_points, hardPointOptions, typeId) {
        return hard_points ? hardPointOptions.filter((hardPointOption) => hardPointOption.type === typeId).map((hardPointOption) => hardPointOption.option) : undefined;
    }

    function getAllWeapons(hard_points, weapons, hardPointWeaponOptions) {
        return hard_points ? weapons.concat(hardPointWeaponOptions) : weapons;
    }

    function getAllSpecialRules(special_rules, cadre, type) {
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
        return all_special_rules;
    }

    function collectSpecialRuleChanges(collectedChanges, special_rules) {
        special_rules.forEach((special_rule) => {
            const ruleParts = special_rule.split("|");
            const ruleId = ruleParts.shift(); //don't include template strings in ID
            const ruleArguments = ruleParts;

            const ruleData = specialRulesData[ruleId];

            let ruleTitleString = `${ruleData.name}: `;
            ruleArguments.forEach((argument, index) => {
                ruleTitleString = ruleTitleString.replaceAll(`{${index}}`, argument);
            });
            if(ruleData.changes) collectedChanges.push({source: ruleTitleString, changes: ruleData.changes});
            if(ruleData.subrules) {
                collectSpecialRuleChanges(collectedChanges, ruleData.subrules);
            }
        });
    }

    function collectChanges(name, changes, weapons, advantages, cadre, type, special_rules, hard_points, hardPointOptions, maneuvers) {
        const collectedChanges = [];

        const hardPointWeaponOptions = getHardPointOptions(hard_points, hardPointOptions, "weapon");
        const hardPointCortexOption = getHardPointOptions(hard_points, hardPointOptions, "cortex");
        const allWeapons = getAllWeapons(hard_points, weapons, hardPointWeaponOptions);
        const all_special_rules = getAllSpecialRules(special_rules, cadre, type);

        if (changes) collectedChanges.push({source: name, changes: changes});

        if (allWeapons) {
            allWeapons.forEach((weapon) => {
                const weaponData = weaponsData[weapon];
                if(weaponData.changes) collectedChanges.push({source: weaponData.name, changes: weaponData.changes});
                if(weaponData.special_rules) {
                    collectSpecialRuleChanges(collectedChanges, weaponData.special_rules);
                }
                if(weaponData.profiles) {
                    weaponData.profiles.forEach((profile) => {
                        if(profile.special_rules) {
                            collectSpecialRuleChanges(collectedChanges, profile.special_rules);
                        }
                    });
                }
            });
        }

        if (hardPointCortexOption) {
            const cortexData = cortexesData[hardPointCortexOption[0]];
            if (cortexData) {
                if(cortexData.changes) collectedChanges.push({source: cortexData.name, changes: cortexData.changes});
                if(cortexData.special_rules) {
                    collectSpecialRuleChanges(collectedChanges, cortexData.special_rules);
                }
            }
        }

        if (advantages) {
            collectSpecialRuleChanges(collectedChanges, advantages);
        }

        if (all_special_rules) {
            collectSpecialRuleChanges(collectedChanges, all_special_rules);
        }

        if (maneuvers) {
            maneuvers.forEach((maneuver) => {
                const maneuverData = maneuversData[maneuver];
                if(maneuverData.changes) collectedChanges.push({source: maneuverData.name, changes: maneuverData.changes});
            });
        }

        let filteredCollectedChanges = [...new Set(collectedChanges.map(JSON.stringify))].map(JSON.parse);

        return filteredCollectedChanges;
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
        const { name, changes, weapons, type, subtypes, factions, dc, stats, base_size, squad_size, special_rules, advantages, maneuvers } = cardData;
        const { boxes } = stats;
        const factionNames = [];
        const subtypeNames = [];
        const unitStatusEntry = getUnitStatusEntry(entryId);

        factions.forEach((faction) => factionNames.push(factionsData[faction].name));
        if(subtypes) {
            subtypes.forEach((subtype) => subtypeNames.push(modelTypesData[subtype].name));
        }

        const [isViewChangesModalOpen, setIsViewChangesModalOpen] = useState(false);

        const collectedChanges = collectChanges(name, changes, weapons, advantages, cadre, type, special_rules, hard_points, hardPointOptions, maneuvers);

        return <IonCardHeader>
            <ViewChangesModal isOpen={isViewChangesModalOpen} setIsOpen={setIsViewChangesModalOpen} changeEntries={collectedChanges}></ViewChangesModal>
            <IonCardTitle color="primary"><h1 style={{margin: 0, fontWeight: "bolder"}}>{name}</h1></IonCardTitle>
            {collectedChanges.length !== 0 && <IonButton onClick={() => {setIsViewChangesModalOpen(true);}}>CHANGES</IonButton>}
            <IonCardSubtitle>
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
                    {hard_points && <HardPointList rulesetId={rulesetId} hard_points={hard_points} hardPointOptions={hardPointOptions} weaponPoints={weapon_points} onChangeHardPoint={updateHardPoint.bind(this)} isPlayMode={isPlayMode}/>}
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

            const all_special_rules = getAllSpecialRules(attachmentCardData.special_rules, attachmentCardData.cadre, attachmentCardData.type);

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
    const all_special_rules = getAllSpecialRules(special_rules, cadre, type);

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
                <CardContent rulesetId={rulesetId} cardData={cardData} specialRules={all_special_rules} weapons={allWeapons} hardPointCortexOption={hardPointCortexOption} attachments={attachments}/>
            </IonContent>
        </IonPage>
    );
}

export default ModelCardViewer;
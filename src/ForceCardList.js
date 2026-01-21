import React, { useEffect, useState, useRef }  from "react";
import { useSessionStorageState } from "ahooks";
import { IonButton, IonLabel, IonList, IonItem, IonItemGroup, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from "@ionic/react";

import { cardSorting, groupSorting } from "./util/sortingUtil";

import HardPointList from "./HardPointList";
import UnitStatus from "./UnitStatus.js";

import { getCypherTypesData, getModelTypesData } from "./DataLoader";

function ForceCardList(props) {
    const { rulesetId, id, forceEntries, unitsStatus, isPlayMode, header, handleCardClicked, hideHiddenTypes, cardActions, typeMin, updateModelHardPoint, setArc, toggleActivation, toggleContinuousEffect, toggleDamageBox } = props;

    const cypherTypesData = getCypherTypesData(rulesetId);
    const modelTypesData = getModelTypesData(rulesetId);

    const forceGroupComponents = [];
    const forceGroups = forceEntries.reduce((memo, current) => {
        const isHero = current["subtypes"] ? current["subtypes"].includes("hero") : false;
        const isChampion = current["subtypes"] ? current["subtypes"].includes("champion") : false;
        const type = isChampion ? "champion" : current["type"] + (isHero ? "|hero" : "");
        //const isHidden = modelTypesData[current["type"]] ? modelTypesData[current["type"]].hidden : cypherTypesData[current["type"]].hidden;
        memo[type] = [...memo[type] || [], current];
        return memo;
    }, {});

    const allGroups = Object.keys(forceGroups);

    const accordionGroup = useRef(null);

    const [collapsedGroups, setCollapsedGroups] = id ? useSessionStorageState(`collapsedForceGroups_${id}`, {defaultValue: []}) : useState([]);

    const collapseGroups = (groups) => {
        if (!accordionGroup.current) {
            return;
        }
        const nativeEl = accordionGroup.current;

        const expandedGroups = allGroups.filter((group) => !groups.includes(group));
        nativeEl.value = expandedGroups;
        setCollapsedGroups(groups);
    };

    const accordionGroupChange = (e) => {
        if(e.target.id !== id) {
            //prevent change events from bubbling up from children
            return; 
        }
        const selectedValue = e.detail.value;
        
        const collapsedGroups = allGroups.filter((group) => !selectedValue.includes(group));
        setCollapsedGroups(collapsedGroups);
      };

    const collapseAll = () => {
        collapseGroups(allGroups);
    };

    const expandAll = () => {
        collapseGroups([]);
    };

    useEffect(() => {
        collapseGroups(collapsedGroups);
    }, [collapsedGroups, forceEntries]);
    
    Object.entries(forceGroups).sort(groupSorting).forEach(([key, value]) => {
        const typeParts = key.split("|");
        // Don't hide champions, mantlets or void gates in reserves
        if (!hideHiddenTypes || (modelTypesData[typeParts[0]] && ((isPlayMode && (typeParts[0] === "champion" || typeParts[0] === "mantlet" || typeParts[0] === "void_gate")) || !modelTypesData[typeParts[0]].hidden))) {
            const entryComponents = [];
            value.sort(cardSorting).forEach((entry, index) => {
                const cardActionButtons = [];
                cardActions && cardActions.forEach((action, index) => {
                    action.handleClicked && action.text && cardActionButtons.push(
                        <IonCol key={index} size="auto">
                            <IonButton size="medium" expand="block" disabled={(action.isDisabled && action.isDisabled(entry.id))} onClick={() => action.handleClicked(entry.id)}>
                                {action.text}
                            </IonButton>
                        </IonCol>
                    );
                });
                const factionId = entry.factions.length === 1 ? entry.factions[0] : "wc";
                const statusEntry = isPlayMode && unitsStatus && unitsStatus.find((deployed) => deployed.id === entry.id);
                entryComponents.push(<div key={index}>
                    <IonRow>
                        <IonCol>
                            <IonButton size="medium" className={factionId} expand="block" onClick={() => handleCardClicked(entry.modelId ? entry.modelId : entry.cypherId, entry.id)}>
                                <div className="button-inner">
                                    <div className="button-text">{entry.name}</div>
                                </div>
                            </IonButton>
                        </IonCol>
                        {cardActionButtons}
                    </IonRow>
                    {entry.hard_points && <IonRow>
                        <IonCol>
                            <HardPointList 
                                rulesetId={rulesetId}
                                hard_points={entry.hard_points} 
                                hardPointOptions={entry.hardPointOptions} 
                                weaponPoints={entry.weapon_points} 
                                onChangeHardPoint={updateModelHardPoint ? ((option, type, point_cost, hardPointIndex) => updateModelHardPoint(option, type, point_cost, hardPointIndex, entry.id)) : null}
                                isPlayMode={isPlayMode}
                            />
                        </IonCol>
                    </IonRow>}
                    {statusEntry && <IonRow>
                        <IonCol>
                            <UnitStatus 
                                rulesetId={rulesetId} 
                                id={entry.id} 
                                entry={statusEntry}
                                handleCardClicked={handleCardClicked}
                                isPlayMode={isPlayMode}
                                collapsible={true}                        
                                setArc={setArc} 
                                toggleActivation={toggleActivation} 
                                toggleContinuousEffect={toggleContinuousEffect} 
                                toggleDamageBox={toggleDamageBox} 
                            ></UnitStatus>
                        </IonCol>
                    </IonRow>}
                </div>
                );
            });
            const typeParts = key.split("|");
            const cardTypeName = modelTypesData[typeParts[0]] ? (typeParts.length !== 1 ? `${modelTypesData[typeParts[1]].name} ` : "") + modelTypesData[typeParts[0]].name : cypherTypesData[typeParts[0]].name;
            forceGroupComponents.push(<IonItemGroup key={key}>
                <IonAccordion value={key} onMouseDown={(event) => event.preventDefault()}>
                    <IonItem slot="header" color={entryComponents.length < typeMin ? "danger" : "tertiary"}>
                        <IonLabel>{`${cardTypeName} (${entryComponents.length})`}</IonLabel>
                    </IonItem>
                    <div className="ion-padding" slot="content">
                        <IonGrid>
                            {entryComponents}
                        </IonGrid>
                    </div>
                </IonAccordion>
            </IonItemGroup>);
        }
    });
    return <>
        {forceEntries.length !== 0 && <>
            <IonLabel color="primary"><h1>{header}</h1></IonLabel>
            <IonButton fill="outline" onClick={() => {collapseAll();}}><div>COLLAPSE ALL</div></IonButton>
            <IonButton fill="outline" onClick={() => {expandAll();}}><div>EXPAND ALL</div></IonButton>
            <IonAccordionGroup id={id} ref={accordionGroup} multiple={true} onIonChange={accordionGroupChange}>
                <IonList>{forceGroupComponents}</IonList>
            </IonAccordionGroup>
        </>}
    </>;
}

export default ForceCardList;
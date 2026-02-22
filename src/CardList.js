import React, { useEffect, useState, useRef } from "react";
import { useSessionStorageState } from "ahooks";
import { IonBadge, IonButton, IonLabel, IonList, IonItem, IonItemGroup, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from "@ionic/react";

import { cardSorting, groupSorting } from "./util/sortingUtil";

import HardPointList from "./HardPointList";
import UnitStatus from "./UnitStatus.js";

import { getCadresData, getCypherTypesData, getModelTypesData } from "./DataLoader";

const mergeCadres = false;

function CardList(props) {
    const { rulesetId, id, cards, unitsStatus, isPlayMode, header, handleCardClicked, hideHiddenTypes, rightInfoText, arcInWell, cardActions, typeMin, updateModelHardPoint, setArc, toggleActivation, toggleContinuousEffect, toggleDamageBox } = props;

    const cadresData = getCadresData(rulesetId);
    const cypherTypesData = getCypherTypesData(rulesetId);
    const modelTypesData = getModelTypesData(rulesetId);

    const cardGroupComponents = [];
    const cardGroups = cards.reduce((memo, current) => {
        const isHero = current["subtypes"] ? current["subtypes"].includes("hero") : false;
        const isChampion = current["subtypes"] ? current["subtypes"].includes("champion") : false;
        const cadreId = current["cadre"] ? current["cadre"] : undefined;
        const hasHiddenSubtype = current["subtypes"] ? current["subtypes"].some((subtype) => modelTypesData[subtype].hidden) : false;
        const isHidden = hasHiddenSubtype || (modelTypesData[current["type"]] ? modelTypesData[current["type"]].hidden : cypherTypesData[current["type"]].hidden);
        const cadreType = cadreId ? `cadre:${cadreId}` + (isChampion ? "|champion" : "") : undefined;
        const type = mergeCadres && cadreId ? cadreType : (current["type"] + (isHero ? "|hero" : "") + (isChampion ? "|champion" : "") + (isHidden ? "|hidden" : ""));
        memo[type] = [...memo[type] || [], current];
        return memo;
    }, {});
    
    //TODO: merge cadre model groups together
    
    const allGroups = Object.keys(cardGroups);

    const accordionGroup = useRef(null);

    const [collapsedGroups, setCollapsedGroups] = id ? useSessionStorageState(`collapsedCardGroups_${id}`, { defaultValue: [] }) : useState([]);

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
    }, [collapsedGroups, cards]);

    Object.entries(cardGroups).sort(groupSorting).forEach(([key, value]) => {
        const typeParts = key.split("|");
        // Don't hide champions, mantlets or void gates in reserves
        const playModeOverrideShow = isPlayMode && typeParts.includes("champion") || typeParts.includes("mantlet") || typeParts.includes("void_gate");
        if (!hideHiddenTypes || (modelTypesData[typeParts[0]] && (playModeOverrideShow || !modelTypesData[typeParts[0]].hidden))) {
            const cardComponents = [];
            value.sort(cardSorting).forEach((card, index) => {
                // Hide specific cards with a hidden subtype as well
                const hasHiddenSubtype = card.subtypes ? card.subtypes.some((subtype) => modelTypesData[subtype].hidden) : false;
                const isHidden = hasHiddenSubtype || (modelTypesData[card.type] ? modelTypesData[card.type].hidden : cypherTypesData[card.type].hidden);
                if (hideHiddenTypes && !playModeOverrideShow && isHidden) {
                    return;
                }
                const cardActionButtons = [];
                cardActions && cardActions.forEach((action, index) => {
                    action.handleClicked && action.text && cardActionButtons.push(
                        <IonCol key={index} size="auto">
                            <IonButton size="medium" expand="block" disabled={(action.isDisabled && action.isDisabled(card))} onClick={() => action.handleClicked(card)}>
                                {action.text}
                            </IonButton>
                        </IonCol>
                    );
                });
                const factionId = card.factions.length === 1 ? card.factions[0] : "wc";
                const statusEntry = isPlayMode && unitsStatus && card.entryId && unitsStatus.find((deployed) => deployed.entryId === card.entryId);
                cardComponents.push(
                    <div key={index}>
                        <IonRow key={index}>
                            <IonCol>
                                <IonButton size="medium" className={factionId} expand="block" onClick={() => handleCardClicked(card)}>
                                    <div className="button-inner">
                                        <div className="button-text">{card.name}</div>
                                    </div>
                                    {rightInfoText && <IonBadge className="button-right-info-text">{rightInfoText(card)}</IonBadge>}
                                </IonButton>
                            </IonCol>
                            {cardActionButtons}
                        </IonRow>
                        {card.entryId && card.hard_points && <IonRow>
                            <IonCol>
                                <HardPointList 
                                    rulesetId={rulesetId}
                                    hard_points={card.hard_points}
                                    hardPointOptions={card.hardPointOptions}
                                    weaponPoints={card.weapon_points}
                                    onChangeHardPoint={updateModelHardPoint ? ((option, type, point_cost, hardPointIndex) => updateModelHardPoint(option, type, point_cost, hardPointIndex, card.entryId)) : null}
                                    isPlayMode={isPlayMode}
                                />
                            </IonCol>
                        </IonRow>}
                        {statusEntry && <IonRow>
                            <IonCol>
                                <UnitStatus 
                                    rulesetId={rulesetId}
                                    id={card.entryId} 
                                    entry={statusEntry}
                                    handleCardClicked={handleCardClicked}
                                    isPlayMode={isPlayMode}
                                    collapsible={true}
                                    setArc={setArc}
                                    toggleActivation={toggleActivation} 
                                    toggleContinuousEffect={toggleContinuousEffect} 
                                    toggleDamageBox={toggleDamageBox}
                                    arcInWell={arcInWell}
                                ></UnitStatus>
                            </IonCol>
                        </IonRow>}
                    </div>
                );
            });

            const isCadre = typeParts[0].includes("cadre");
            const cadreId = isCadre ? typeParts[0].split(":")[1] : undefined;
            const subtype = typeParts.length !== 1 ? `${modelTypesData[typeParts[1]] ? modelTypesData[typeParts[1]].name : ""}` : "";
            const cardTypeName = cadreId ? `${cadresData[cadreId].name} ${subtype}` : modelTypesData[typeParts[0]] ? `${subtype} ${modelTypesData[typeParts[0]].name}` : cypherTypesData[typeParts[0]].name;
            if(hideHiddenTypes && typeParts.includes("champion")) {
                return;
            }
            cardGroupComponents.push(<IonItemGroup key={key}>
                <IonAccordion value={key} onMouseDown={(event) => event.preventDefault()}>
                    <IonItem slot="header" color={typeMin && cardComponents.length < typeMin ? "danger" : "tertiary"}>
                        <IonLabel>{`${cardTypeName} (${cardComponents.length})`}</IonLabel>
                    </IonItem>
                    <div className="ion-padding" slot="content"> 
                        <IonGrid>{cardComponents}</IonGrid>
                    </div>
                </IonAccordion>
            </IonItemGroup>);
        }
    });
    return <>
        {cards.length !== 0 && <><IonLabel color="primary"><h1>{header}</h1></IonLabel>
        <IonButton fill="outline" className={"label"} onClick={() => {collapseAll();}}><div>COLLAPSE ALL</div></IonButton>
        <IonButton fill="outline" className={"label"} onClick={() => {expandAll();}}><div>EXPAND ALL</div></IonButton>
        <IonAccordionGroup id={id} ref={accordionGroup} multiple={true} onIonChange={accordionGroupChange}>
            <IonList>{cardGroupComponents}</IonList>
        </IonAccordionGroup></>}
    </>;
}

export default CardList;
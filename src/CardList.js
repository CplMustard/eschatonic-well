import React, { useEffect, useState, useRef } from "react";
import { useSessionStorageState } from "ahooks";
import { IonBadge, IonButton, IonLabel, IonList, IonItem, IonItemGroup, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from "@ionic/react";

import { cardSorting, groupSorting } from "./util/sortingUtil";

import { getCypherTypesData, getModelTypesData } from "./DataLoader";

function CardList(props) {
    const { rulesetId, id, cards, header, hideHiddenTypes, handleCardClicked, rightInfoText, cardActions } = props;

    const cypherTypesData = getCypherTypesData(rulesetId);
    const modelTypesData = getModelTypesData(rulesetId);

    const cardGroupComponents = [];
    const cardGroups = cards.reduce((memo, current) => {
        const isHero = current["subtypes"] ? current["subtypes"].includes("hero") : false;
        const isChampion = current["subtypes"] ? current["subtypes"].includes("champion") : false;
        const cadreId = current["cadre"] ? current["cadre"] : undefined;
        const isHidden = modelTypesData[current["type"]] ? modelTypesData[current["type"]].hidden : cypherTypesData[current["type"]].hidden;
        const type = current["type"] + (isHero ? "|hero" : "") + (isHidden ? "|hidden" : "") + (isChampion ? "|champion" : "") + (cadreId ? `|cadre:${cadreId}` : "");
        memo[type] = [...memo[type] || [], current];
        return memo;
    }, {});
    
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
        if (!hideHiddenTypes || (modelTypesData[typeParts[0]] && (!modelTypesData[typeParts[0]].hidden))) {
            const cardComponents = [];
            value.sort(cardSorting).forEach((card, index) => {
                const hasHiddenSubtype = hideHiddenTypes && (card.hidden || (card.subtypes ? card.subtypes.some((subtype) => modelTypesData[subtype].hidden) : false));
                if(!hasHiddenSubtype) {
                    const cardActionButtons = [];
                    cardActions && cardActions.forEach((action, index) => {
                        action.handleClicked && action.text && cardActionButtons.push(
                            <IonCol key={index} size="auto">
                                <IonButton size="medium" expand="block" disabled={(action.isDisabled && action.isDisabled(card.id))} onClick={() => action.handleClicked(card.id)}>
                                    {action.text}
                                </IonButton>
                            </IonCol>
                        );
                    });
                    const factionId = card.factions.length === 1 ? card.factions[0] : "wc";
                    cardComponents.push(
                        <IonRow key={index}>
                            <IonCol>
                                <IonButton size="medium" className={factionId} expand="block" onClick={() => handleCardClicked(card.id)}>
                                    <div className="button-inner">
                                        <div className="button-text">{card.name}</div>
                                    </div>
                                    {rightInfoText && <IonBadge className="button-right-info-text">{rightInfoText(card.id)}</IonBadge>}
                                </IonButton>
                            </IonCol>
                            {cardActionButtons}
                        </IonRow>
                    );
                }
            });

            const cardTypeName = modelTypesData[typeParts[0]] ? (typeParts.length !== 1 ? `${modelTypesData[typeParts[1]] ? modelTypesData[typeParts[1]].name : ""} ` : "") + modelTypesData[typeParts[0]].name : cypherTypesData[typeParts[0]].name;
            cardGroupComponents.push(<IonItemGroup key={key}>
                <IonAccordion value={key} onMouseDown={(event) => event.preventDefault()}>
                    <IonItem slot="header" color="tertiary">
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
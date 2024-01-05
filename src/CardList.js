import React, { useEffect, useRef } from "react";
import { IonBadge, IonButton, IonLabel, IonList, IonItem, IonItemGroup, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from "@ionic/react";

import { cardSorting, groupSorting } from "./util/sortingUtil";

import { cypherTypesData, modelTypesData } from "./data";

function CardList(props) {
    const { cards, header, hideHiddenTypes, handleCardClicked, faText, cardActions } = props;
    const cardGroupComponents = [];
    const cardGroups = cards.reduce((memo, current) => {
        const isHero = current["subtypes"] ? current["subtypes"].includes("hero") : false;
        const isChampion = current["subtypes"] ? current["subtypes"].includes("champion") : false;
        const type = isChampion ? "champion" : current["type"] + (isHero ? "|hero" : "");
        memo[type] = [...memo[type] || [], current];
        return memo;
    }, {});
    
    const allGroups = Object.keys(cardGroups);

    const accordionGroup = useRef(null);
    const collapseAll = () => {
        if (!accordionGroup.current) {
            return;
        }
        const nativeEl = accordionGroup.current;

        nativeEl.value = undefined;
    };

    const expandAll = () => {
        if (!accordionGroup.current) {
            return;
        }
        const nativeEl = accordionGroup.current;

        nativeEl.value = allGroups;
    };

    useEffect(() => {
        expandAll();
    }, [expandAll]);

    Object.entries(cardGroups).sort(groupSorting).forEach(([key, value]) => {
        const typeParts = key.split("|");
        if (!hideHiddenTypes || (modelTypesData[typeParts[0]] && !modelTypesData[typeParts[0]].hidden)) {
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
                                    {faText && <IonBadge className="button-fa">{faText(card.id)}</IonBadge>}
                                </IonButton>
                            </IonCol>
                            {cardActionButtons}
                        </IonRow>
                    );
                }
            });

            const cardTypeName = modelTypesData[typeParts[0]] ? (typeParts.length !== 1 ? `${modelTypesData[typeParts[1]].name} ` : "") + modelTypesData[typeParts[0]].name : cypherTypesData[typeParts[0]].name;
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
        <IonButton fill="outline" onClick={() => {collapseAll();}}><div>COLLAPSE ALL</div></IonButton>
        <IonButton fill="outline" onClick={() => {expandAll();}}><div>EXPAND ALL</div></IonButton>
        <IonAccordionGroup ref={accordionGroup} multiple={true}>
            <IonList>{cardGroupComponents}</IonList>
        </IonAccordionGroup></>}
    </>;
}

export default CardList;
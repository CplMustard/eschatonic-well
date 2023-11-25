import React from 'react';
import { IonButton, IonLabel, IonList, IonItem, IonItemGroup, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from '@ionic/react';

import { cypherTypesData, modelTypesData } from './data';

function CardList(props) {
    const { cards, header, hideHiddenTypes, handleCardClicked, cardActions } = props;
    const cardGroupComponents = [];
    const cardGroupKeys = [];
    const cardGroups = cards.reduce((memo, current) => {
        const isHero = current["subtypes"] ? current["subtypes"].includes("hero") : false;
        const type = current["type"] + (isHero ? "|hero" : "");
        memo[type] = [...memo[type] || [], current];
        return memo;
    }, {});
    Object.entries(cardGroups).sort().forEach(([key, value]) => {
        const typeParts = key.split("|");
        if (!hideHiddenTypes || (modelTypesData[typeParts[0]] && !modelTypesData[typeParts[0]].hidden)) {
            const cardComponents = []
            value.forEach((card, index) => {
                const hasHiddenSubtype = hideHiddenTypes && (card.hidden || (card.subtypes ? card.subtypes.some((subtype) => modelTypesData[subtype].hidden) : false));
                if(!hasHiddenSubtype) {
                    const cardActionButtons = [];
                    cardActions && cardActions.forEach((action, index) => {
                        action.handleClicked && action.text && !(action.isHidden && action.isHidden(card.id)) && cardActionButtons.push(
                            <IonCol key={index} size="auto">
                                <IonButton size="medium" expand="full" onClick={() => action.handleClicked(card.id)}>
                                    {action.text}
                                </IonButton>
                            </IonCol>
                        )
                    });
                    cardComponents.push(
                        <IonRow key={index}>
                            <IonCol>
                                <IonButton size="medium" className="ion-text-wrap" expand="full" onClick={() => handleCardClicked(card.id)}>
                                    <div className="button-inner">
                                        <div className="button-text">{card.name}</div>
                                    </div>
                                </IonButton>
                            </IonCol>
                            {cardActionButtons}
                        </IonRow>
                    );
                }
            })

            const cardTypeName = modelTypesData[typeParts[0]] ? (typeParts.length !== 1 ? `${modelTypesData[typeParts[1]].name} ` : "") + modelTypesData[typeParts[0]].name : cypherTypesData[typeParts[0]].name;
            cardGroupComponents.push(<IonItemGroup key={key}>
                <IonAccordion value={key}>
                    <IonItem slot="header" color="tertiary">
                        <IonLabel>{`${cardTypeName} (${cardComponents.length})`}</IonLabel>
                    </IonItem>
                    <div className="ion-padding" slot="content"> 
                        <IonGrid>{cardComponents}</IonGrid>
                    </div>
                </IonAccordion>
            </IonItemGroup>);
            cardGroupKeys.push(key);
        }
    })
    return <IonAccordionGroup multiple={true} value={cardGroupKeys}><IonLabel color="primary"><h1>{header}</h1></IonLabel><IonList>{cardGroupComponents}</IonList></IonAccordionGroup>;
}

export default CardList;
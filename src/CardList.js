import React from 'react';
import { IonButton, IonLabel, IonList, IonItemDivider, IonItemGroup, IonListHeader, IonGrid, IonCol, IonRow } from '@ionic/react';

import { cypherTypesData, modelTypesData } from './data';

function CardList(props) {
    const { cards, header, hideHiddenTypes, handleCardClicked, cardActions } = props;
    const cardGroupComponents = [];
    const cardGroups = cards.reduce((memo, current) => {
        memo[current["type"]] = [...memo[current["type"]] || [], current];
        return memo;
    }, {});
    Object.entries(cardGroups).sort().forEach(([key, value]) => {
        if (!hideHiddenTypes || (modelTypesData[key] && !modelTypesData[key].hidden)) {
            const cardComponents = []
            value.forEach((card, index) => {
                const hasHiddenSubtype = hideHiddenTypes && card.hidden || (card.subtypes ? card.subtypes.some((subtype) => modelTypesData[subtype].hidden) : false);
                if(!hasHiddenSubtype) {
                    const cardActionButtons = [];
                    cardActions && cardActions.forEach((action) => {
                        action.handleClicked && action.text && !(action.isHidden && action.isHidden(card.id)) && cardActionButtons.push(
                            <IonCol size="auto">
                                <IonButton key={action.text} size="medium" expand="full" onClick={() => action.handleClicked(card.id)}>
                                    {action.text}
                                </IonButton>
                            </IonCol>
                        )
                    });
                    cardComponents.push(<IonRow key={index}>
                        <IonCol>
                            <IonButton size="medium" expand="full" onClick={() => handleCardClicked(card.id)}>
                                {card.name}
                            </IonButton>
                        </IonCol>
                        {cardActionButtons}
                    </IonRow>);
                }
            })
            const cardTypeName = modelTypesData[key] ? modelTypesData[key].name : cypherTypesData[key].name;
            cardGroupComponents.push(<IonItemGroup key={key}>
                <IonItemDivider color="tertiary">
                    <IonLabel><h4>{cardTypeName}</h4></IonLabel>
                </IonItemDivider>
                <IonGrid>{cardComponents}</IonGrid>
            </IonItemGroup>)
        }
    })
    return <><IonListHeader color="primary"><IonLabel>{header}</IonLabel></IonListHeader><IonList>{cardGroupComponents}</IonList></>;
}

export default CardList;
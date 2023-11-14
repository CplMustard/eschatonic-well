import React from 'react';
import { IonText, IonItem, IonButton, IonLabel, IonList, IonListHeader } from '@ionic/react';

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
                const hasHiddenSubtype = hideHiddenTypes && card.subtypes ? card.subtypes.some((subtype) => modelTypesData[subtype].hidden) : false;
                if(!hasHiddenSubtype && !card.hidden) {
                    const cardActionButtons = [];
                    cardActions && cardActions.forEach((action) => {
                        action.handleClicked && action.text && !(action.isHidden && action.isHidden(card.id)) && cardActionButtons.push(<IonButton key={action.text} onClick={() => action.handleClicked(card.id)}>{action.text}</IonButton>)
                    });
                    cardComponents.push(<IonItem key={index}><IonButton onClick={() => handleCardClicked(card.id)}>{card.name}</IonButton>{cardActionButtons}</IonItem>);
                }
            })
            const cardTypeName = modelTypesData[key] ? modelTypesData[key].name : cypherTypesData[key].name;
            cardGroupComponents.push(<div key={key}>
                <IonText color="primary">
                    <h4>{cardTypeName}</h4>
                </IonText>
                <IonItem>
                    <IonList>{cardComponents}</IonList>
                </IonItem>
            </div>)
        }
    })
    return <><IonListHeader color="primary"><IonLabel>{header}</IonLabel></IonListHeader><IonList>{cardGroupComponents}</IonList></>;
}

export default CardList;
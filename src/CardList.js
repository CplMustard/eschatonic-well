import React from 'react';
import { IonItem, IonButton, IonList } from '@ionic/react';

import { cypherTypesData, modelTypesData } from './data';

function CardList(props) {
    const { cards, header, hideHiddenTypes, handleCardClicked, cardActionClicked, cardActionText } = props;
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
                    cardComponents.push(<IonItem key={index}><IonButton onClick={() => handleCardClicked(card.id)}>{card.name}</IonButton>{cardActionClicked && <IonButton onClick={() => cardActionClicked(card.id)}>{cardActionText}</IonButton>}</IonItem>);
                }
            })
            const cardTypeName = modelTypesData[key] ? modelTypesData[key].name : cypherTypesData[key].name;
            cardGroupComponents.push(<div key={key}><h4>{cardTypeName}</h4><IonItem><IonList>{cardComponents}</IonList></IonItem></div>)
        }
    })
    return <><h3>{header}</h3><IonList>{cardGroupComponents}</IonList></>;
}

export default CardList;
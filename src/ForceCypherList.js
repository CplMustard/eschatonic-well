import React from 'react';
import { IonText, IonItem, IonButton, IonLabel, IonList, IonListHeader } from '@ionic/react';

import { cypherTypesData } from './data'

function ForceCypherList(props) {
    const { forceEntries, header, cypherTypeMin, handleCardClicked, cardActions } = props;
    
    const forceGroupComponents = [];
    const forceGroups = forceEntries.reduce((memo, current) => {
        memo[current["type"]] = [...memo[current["type"]] || [], current];
        return memo;
    }, {});
    Object.entries(forceGroups).sort().forEach(([key, value]) => {
        const entryComponents = [];
        value.sort((a, b) => a.name > b.name).forEach((entry, index) => {
            const cardActionButtons = [];
            cardActions && cardActions.forEach((action) => {
                action.handleClicked && action.text && !(action.isHidden && action.isHidden(entry.id)) && cardActionButtons.push(<IonButton key={action.text} onClick={() => action.handleClicked(entry.id)}>{action.text}</IonButton>)
            });
            entryComponents.push(<IonItem key={index}><IonButton onClick={() => handleCardClicked(entry.cypherId)}>{entry.name}</IonButton>{cardActionButtons}</IonItem>)
        });
        const cardTypeName = cypherTypesData[key].name;
        forceGroupComponents.push(<div key={key}><IonText color={entryComponents.length < cypherTypeMin ? "danger" : "primary"}><h4>{cardTypeName} ({entryComponents.length})</h4></IonText><IonItem><IonList>{entryComponents}</IonList></IonItem></div>);
    });
    return <><IonListHeader color="primary"><IonLabel>{header}</IonLabel></IonListHeader><IonList>{forceGroupComponents}</IonList></>;
}

export default ForceCypherList;
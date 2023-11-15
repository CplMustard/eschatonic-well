import React from 'react';
import { IonText, IonItem, IonButton, IonLabel, IonList, IonItemDivider, IonItemGroup, IonListHeader } from '@ionic/react';

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
                action.handleClicked && action.text && !(action.isHidden && action.isHidden(entry.id)) && cardActionButtons.push(<IonButton key={action.text} size="medium" expand="full" onClick={() => action.handleClicked(entry.id)}>{action.text}</IonButton>)
            });
            entryComponents.push(<IonItem key={index}><IonButton size="medium" expand="full" onClick={() => handleCardClicked(entry.cypherId)}>{entry.name}</IonButton>{cardActionButtons}</IonItem>)
        });
        const cardTypeName = cypherTypesData[key].name;
        forceGroupComponents.push(<IonItemGroup key={key}>
            <IonItemDivider color={entryComponents.length < cypherTypeMin ? "danger" : "tertiary"}>
                <IonLabel><h4>{cardTypeName} ({entryComponents.length})</h4></IonLabel>
            </IonItemDivider>
            {entryComponents}
        </IonItemGroup>);
    });
    return <><IonListHeader color="primary"><IonLabel><h2>{header}</h2></IonLabel></IonListHeader><IonList>{forceGroupComponents}</IonList></>;
}

export default ForceCypherList;
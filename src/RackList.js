import React from 'react';
import { IonButton, IonLabel, IonList, IonItemDivider, IonItemGroup, IonListHeader, IonGrid, IonCol, IonRow } from '@ionic/react';

import { cypherTypesData } from './data'

function RackList(props) {
    const { forceEntries, header, typeMin, handleCardClicked, cardActions } = props;
    
    const forceGroupComponents = [];
    const forceGroups = forceEntries.reduce((memo, current) => {
        memo[current["type"]] = [...memo[current["type"]] || [], current];
        return memo;
    }, {});
    Object.entries(forceGroups).sort().forEach(([key, value]) => {
        const entryComponents = [];
        value.sort((a, b) => a.name > b.name).forEach((entry, index) => {
            const cardActionButtons = [];
            cardActions && cardActions.forEach((action, index) => {
                action.handleClicked && action.text && !(action.isHidden && action.isHidden(entry.id)) && cardActionButtons.push(
                    <IonCol key={index} size="auto">
                        <IonButton size="medium" expand="full" onClick={() => action.handleClicked(entry.id)}>
                            {action.text}
                        </IonButton>
                    </IonCol>
                )
            });
            entryComponents.push(<IonRow key={index}>
                <IonCol>
                    <IonButton size="medium" className="ion-text-wrap" expand="full" onClick={() => handleCardClicked(entry.cypherId)}>
                        <div className="button-inner">
                            <div className="button-text">{entry.name}</div>
                        </div>
                    </IonButton>
                </IonCol>
                {cardActionButtons}
            </IonRow>)
        });
        const cardTypeName = cypherTypesData[key].name;
        forceGroupComponents.push(<IonItemGroup key={key}>
            <IonItemDivider color={entryComponents.length < typeMin ? "danger" : "tertiary"}>
                <IonLabel><h4>{cardTypeName} ({entryComponents.length})</h4></IonLabel>
            </IonItemDivider>
            <IonGrid>
                {entryComponents}
            </IonGrid>
        </IonItemGroup>);
    });
    return <><IonLabel color="primary"><h1>{header}</h1></IonLabel><IonList>{forceGroupComponents}</IonList></>;
}

export default RackList;
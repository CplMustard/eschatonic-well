import React from 'react';
import { IonText, IonButton, IonLabel, IonList, IonItemDivider, IonListHeader, IonItemGroup, IonGrid, IonCol, IonRow } from '@ionic/react';

import HardPointList from './HardPointList';

import { modelTypesData } from './data'

function ForceModelList(props) {
    const { forceEntries, header, handleCardClicked, cardActions, updateModelHardPoint } = props;

    const forceGroupComponents = [];
    const forceGroups = forceEntries.reduce((memo, current) => {
        const isHero = current["subtypes"] ? current["subtypes"].includes("hero") : false;
        const type = current["type"] + (isHero ? "|hero" : "");
        memo[type] = [...memo[type] || [], current];
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
            entryComponents.push(<div key={index}>
                <IonRow>
                    <IonCol>
                        <IonButton size="medium" className="ion-text-wrap" expand="full" onClick={() => handleCardClicked(entry.modelId, entry.id)}>
                            <div className="button-inner">
                                <div className="button-text">{entry.name}</div>
                            </div>
                        </IonButton>
                    </IonCol>
                    {cardActionButtons}
                </IonRow>
                <IonRow>
                    {entry.hard_points && <IonCol>
                        <HardPointList hard_points={entry.hard_points} hardPointOptions={entry.hardPointOptions} weaponPoints={entry.weapon_points} onChangeHardPoint={(option, type, point_cost, hardPointIndex) => updateModelHardPoint(option, type, point_cost, hardPointIndex, entry.id)}/>
                    </IonCol>}
                </IonRow>
            </div>
            );
        })
        const typeParts = key.split("|");
        const cardTypeName = (typeParts.length !== 1 ? `${modelTypesData[typeParts[1]].name} ` : "") + modelTypesData[typeParts[0]].name;
        forceGroupComponents.push(<IonItemGroup key={key}>
            <IonItemDivider color="tertiary">
                <IonLabel><h4>{cardTypeName} ({entryComponents.length})</h4></IonLabel>
            </IonItemDivider>
            <IonGrid>
                {entryComponents}
            </IonGrid>
        </IonItemGroup>)
    })
    return <><IonLabel color="primary"><h1>{header}</h1></IonLabel><IonList>{forceGroupComponents}</IonList></>;
}

export default ForceModelList;
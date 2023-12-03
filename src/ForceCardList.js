import React from 'react';
import { IonButton, IonLabel, IonList, IonItem, IonItemGroup, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from '@ionic/react';

import HardPointList from './HardPointList';

import { cypherTypesData, modelTypesData } from './data'

function ForceCardList(props) {
    const { forceEntries, header, handleCardClicked, cardActions, typeMin, updateModelHardPoint } = props;

    const forceGroupComponents = [];
    const forceGroups = forceEntries.reduce((memo, current) => {
        const isHero = current["subtypes"] ? current["subtypes"].includes("hero") : false;
        const isChampion = current["subtypes"] ? current["subtypes"].includes("champion") : false;
        const type = isChampion ? "champion" : current["type"] + (isHero ? "|hero" : "");
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
                        <IonButton size="medium" className="ion-text-wrap" expand="full" onClick={() => handleCardClicked(entry.modelId ? entry.modelId : entry.cypherId, entry.id)}>
                            <div className="button-inner">
                                <div className="button-text">{entry.name}</div>
                            </div>
                        </IonButton>
                    </IonCol>
                    {cardActionButtons}
                </IonRow>
                {entry.hard_points && <IonRow>
                    <IonCol>
                        <HardPointList 
                            hard_points={entry.hard_points} 
                            hardPointOptions={entry.hardPointOptions} 
                            weaponPoints={entry.weapon_points} 
                            onChangeHardPoint={(option, type, point_cost, hardPointIndex) => updateModelHardPoint(option, type, point_cost, hardPointIndex, entry.id)}
                        />
                    </IonCol>
                </IonRow>}
            </div>
            );
        })
        const typeParts = key.split("|");
        const cardTypeName = modelTypesData[typeParts[0]] ? (typeParts.length !== 1 ? `${modelTypesData[typeParts[1]].name} ` : "") + modelTypesData[typeParts[0]].name : cypherTypesData[typeParts[0]].name;
        forceGroupComponents.push(<IonItemGroup key={key}>
            <IonAccordion value={key}>
                <IonItem slot="header" color={entryComponents.length < typeMin ? "danger" : "tertiary"}>
                    <IonLabel>{`${cardTypeName} (${entryComponents.length})`}</IonLabel>
                </IonItem>
                <div className="ion-padding" slot="content">
                    <IonGrid>
                        {entryComponents}
                    </IonGrid>
                </div>
            </IonAccordion>
        </IonItemGroup>);
    })
    return <IonAccordionGroup multiple={true}><IonLabel color="primary"><h1>{header}</h1></IonLabel><IonList>{forceGroupComponents}</IonList></IonAccordionGroup>;
}

export default ForceCardList;
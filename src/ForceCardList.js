import React, { useEffect, useRef }  from 'react';
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

    const allGroups = Object.keys(forceGroups);

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
    
    Object.entries(forceGroups).sort().forEach(([key, value]) => {
        const entryComponents = [];
        value.sort((a, b) => a.factions.length < b.factions.length || a.factions > b.factions || a.name > b.name).forEach((entry, index) => {
            const cardActionButtons = [];
            cardActions && cardActions.forEach((action, index) => {
                action.handleClicked && action.text && cardActionButtons.push(
                    <IonCol key={index} size="auto">
                        <IonButton size="medium" expand="block" disabled={(action.isDisabled && action.isDisabled(entry.id))} onClick={() => action.handleClicked(entry.id)}>
                            {action.text}
                        </IonButton>
                    </IonCol>
                )
            });
            const factionId = entry.factions.length === 1 ? entry.factions[0] : "wc";
            entryComponents.push(<div key={index}>
                <IonRow>
                    <IonCol>
                        <IonButton size="medium" className={factionId} expand="block" onClick={() => handleCardClicked(entry.modelId ? entry.modelId : entry.cypherId, entry.id)}>
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
    return <>
        {forceEntries.length !== 0 && <>
            <IonLabel color="primary"><h1>{header}</h1></IonLabel>
            <IonButton fill="outline" onClick={() => {collapseAll()}}><div>COLLAPSE ALL</div></IonButton>
            <IonButton fill="outline" onClick={() => {expandAll()}}><div>EXPAND ALL</div></IonButton>
            <IonAccordionGroup ref={accordionGroup} multiple={true}>
                <IonList>{forceGroupComponents}</IonList>
            </IonAccordionGroup>
        </>}
    </>
}

export default ForceCardList;
import React from 'react';
import { IonItem, IonLabel, IonButton, IonList, IonListHeader } from '@ionic/react';

function CadreList(props) {
    const { cadresData, addModelCards, factionId } = props
    const cadreButtonComponents = []
    Object.entries(cadresData).forEach(([key, value]) => {
        if(value.faction === factionId) {
            cadreButtonComponents.push(<IonItem key={key}><label><h2>{value.name}</h2> <IonButton onClick={() => addModelCards(value.models)}>ADD</IonButton></label></IonItem>);
        }
    })

    return (
        <div>
            <IonListHeader color="primary"><IonLabel>Cadres</IonLabel></IonListHeader>{factionId && factionId !== "all" && <IonList>{cadreButtonComponents}</IonList>}
        </div>
    );
}

export default CadreList;
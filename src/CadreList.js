import React from 'react';
import { IonItem, IonLabel, IonButton, IonList } from '@ionic/react';

function CadreList(props) {
    const { cadresData, addModelCards, factionId } = props
    const cadreButtonComponents = []
    Object.entries(cadresData).forEach(([key, value]) => {
        if(value.faction === factionId) {
            cadreButtonComponents.push(<IonItem key={key}><label>{value.name} <IonButton onClick={() => addModelCards(value.models)}>ADD</IonButton></label></IonItem>);
        }
    })

    return (
        <div>
            <IonLabel>Cadres</IonLabel>{factionId && factionId !== "all" && <IonList>{cadreButtonComponents}</IonList>}
        </div>
    );
}

export default CadreList;
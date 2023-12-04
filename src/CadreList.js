import React from 'react';
import { useNavigate } from "react-router-dom";
import { IonItem, IonLabel, IonButton, IonIcon, IonGrid, IonCol, IonRow, IonAccordion, IonAccordionGroup } from '@ionic/react';
import { add } from 'ionicons/icons';

function CadreList(props) {
    const navigate  = useNavigate();
    
    const { cadresData, addModelCards, factionId } = props
    const cadreButtonComponents = []

    function handleCadreClicked(id) {
        navigate(`/cadre/${id}`);
    }
    Object.entries(cadresData).forEach(([key, value]) => {
        if(factionId === 'all' || value.faction === factionId) {
            cadreButtonComponents.push(<IonRow key={key}>
                <IonCol>
                    <IonButton size="medium" className="ion-text-wrap" expand="full" onClick={() => handleCadreClicked(value.id)}>
                        <div className="button-inner">
                            <div className="button-text">{value.name}</div>
                        </div>
                    </IonButton>
                </IonCol>
                <IonCol size="auto">
                        <IonButton size="medium" expand="full" onClick={() => addModelCards(value.models)}>
                            <IonIcon slot="icon-only" icon={add}></IonIcon>
                        </IonButton>
                    </IonCol>
            </IonRow>);
        }
    })

    return (
        <div>
            <IonAccordionGroup value="cadres">
                <IonAccordion value="cadres">
                    <IonItem slot="header" color="tertiary">
                        <IonLabel>{`Cadres (${cadreButtonComponents.length})`}</IonLabel>
                    </IonItem>
                    {factionId && <div className="ion-padding" slot="content">
                        <IonGrid>
                            {cadreButtonComponents}
                        </IonGrid>
                    </div>}
                </IonAccordion>
            </IonAccordionGroup>
        </div>
    );
}

export default CadreList;
import React, { createRef }from "react";
import { useHistory } from "react-router-dom";
import { IonPage, IonContent, IonHeader, IonButton } from "@ionic/react";

import VersionNumber from "./VersionNumber";

function LandingPage() {
    const history = useHistory();
    const contentRef = createRef();

    return (
        <IonPage>
            <IonHeader>
                <VersionNumber/>
            </IonHeader>
            <IonContent ref={contentRef}>
                <IonButton onClick={() => history.push("/editor")}>
                    CREATE FORCE
                </IonButton>
                <IonButton onClick={() => history.push("/play")}>
                    PLAY GAME
                </IonButton>
                <IonButton onClick={() => history.push("/cards")}>
                    VIEW CARDS
                </IonButton>
            </IonContent>
        </IonPage>
    );
}

export default LandingPage;

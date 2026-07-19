import React, { createRef }from "react";
import { useHistory } from "react-router-dom";
import { IonPage, IonContent, IonFooter, IonText, IonImg, IonButton, IonGrid, IonCol, IonRow} from "@ionic/react";

import logo from "./assets/images/eschatonic-well.png";

function LandingPage() {
    const history = useHistory();
    const contentRef = createRef();

    return (
        <IonPage>
            <IonContent ref={contentRef}>
                <div className={"landing-page"}>
                    <IonImg className={"logo"} src={logo}></IonImg>
                    <IonText className={"title"}><h1>ESCHATONIC WELL</h1></IonText>
                    <IonText className={"title"}><h4>The Unofficial Companion App for Warcaster: Neo Mechanika</h4></IonText>
                    <IonGrid>
                        <IonRow>
                            <IonCol>
                                <IonButton className={"landing-page-buttons"} expand={"full"} onClick={() => history.push("/editor")}>
                                    <IonText><h2>CREATE FORCE</h2></IonText>
                                </IonButton>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol>
                                <IonButton className={"landing-page-buttons"} expand={"full"} onClick={() => history.push("/play")}>
                                    <IonText><h2>PLAY GAME</h2></IonText>
                                </IonButton>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol>
                                <IonButton className={"landing-page-buttons"} expand={"full"} onClick={() => history.push("/cards")}>
                                    <IonText><h2>VIEW CARDS</h2></IonText>
                                </IonButton>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent>
            <IonFooter className={"footer-text"}>
                <IonText>
                    <p>Copyright (c) 2026 Jack Anderson</p>
                    <p>This program is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Steamforged Games Ltd, or any of its subsidiaries or its affiliates.</p>
                    <p>All trademarks contained herein including Steamforged Games (c), Warcaster (r), warjack (r), Marcher Worlds, Aeternus Continuum, Iron Star Alliance, The Empyreans, Coalition Rangers, The Thousand Worlds, The Hyperuranion, Arcanessence, and their logos are property of Steamforged Games Ltd, Osprey House, 217-227 Broadway, Salford, Manchester, M50 2UE, United Kingdom</p>
                </IonText>
            </IonFooter>
        </IonPage>
    );
}

export default LandingPage;

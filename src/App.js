import React from "react";

import { Route } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";
import { IonApp, IonRouterOutlet } from "@ionic/react";

import "./App.css";

import LandingPage from "./LandingPage";
import EditorView from "./EditorView";
import CadreViewer from "./CadreViewer";
import CardView from "./CardView";
import CypherCardViewer from "./CypherCardViewer";
import ModelCardViewer from "./ModelCardViewer";
import PlayView from "./PlayView";
import VersionNumber from "./VersionNumber";

function App() {
    return (
        <div style={{ margin: "0 1rem 0 1rem", paddingTop: "env(safe-area-inset-top)" }}>
            <VersionNumber/>
            <IonApp className="App">
                <IonReactRouter>
                    <IonRouterOutlet>
                        <Route exact path="/" component={LandingPage} />
                        <Route path="/editor" component={EditorView} />
                        <Route path="/cards" component={CardView} />
                        <Route path="/play" component={PlayView} />
                        <Route path="/cadre/:cadreId" component={CadreViewer} />
                        <Route path="/cypher/:cypherId" component={CypherCardViewer} />
                        <Route path="/model/:modelId" component={ModelCardViewer} />
                    </IonRouterOutlet>
                </IonReactRouter>
            </IonApp>
        </div>
    );
}

export default App;
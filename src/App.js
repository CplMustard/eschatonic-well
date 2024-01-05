import React from "react";

import { Route } from "react-router-dom";
import { IonReactRouter } from "@ionic/react-router";
import { IonApp, IonRouterOutlet } from "@ionic/react";

import "./App.css";

import EditorView from "./EditorView";
import CadreViewer from "./CadreViewer";
import CypherCardViewer from "./CypherCardViewer";
import ModelCardViewer from "./ModelCardViewer";

function App() {
    return (
        <div style={{ margin: "0 1rem 0 1rem", paddingTop: "env(safe-area-inset-top)" }}>
            <IonApp className="App">
                <IonReactRouter>
                    <IonRouterOutlet>
                        <Route exact path="/" component={EditorView} />
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
import React, { useState } from "react";
import { IonContent, IonModal, IonHeader, IonFooter, IonToolbar, IonButtons, IonTitle, IonButton, IonList, IonItem, IonToggle, useIonAlert, } from "@ionic/react";

import { settingsFilename, saveUserSettings } from "../util/fileUtil";
import { userSettingsDefault } from "../data";

const loadedUserSettings = userSettingsDefault;//await loadUserSettings();

function SettingsModal (props) {    
    const [presentAlert] = useIonAlert();

    const { isOpen, setIsOpen } = props;

    const [currentUserSettings, setCurrentUserSettings] = useState(loadedUserSettings);

    const saveFileConfirm = async (fileData) => {
        presentAlert({
            header: "Save Settings",
            message: "Save these settings?",
            buttons: [
                {
                    text: "Cancel",
                    role: "cancel",
                    handler: () => {},
                },
                {
                    text: "OK",
                    role: "confirm",
                    handler: () => {
                        saveUserSettings(fileData);
                        setIsOpen(false);
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    };

    const updateSetting = (settingName, settingValue) => {
        let newUserSettings = currentUserSettings;
        newUserSettings[settingName] = settingValue;
        setCurrentUserSettings(newUserSettings);
    };

    const createNewToggle = (settingName, settingDescription) => {
        return <IonToggle key={settingName} checked={currentUserSettings && (currentUserSettings[settingName] ? currentUserSettings[settingName] : userSettingsDefault[settingName])} onIonChange={(e) => updateSetting(settingName, e.value)}>
           {settingDescription}
        </IonToggle>;
    };

    const settings = [];
    settings.push(createNewToggle("groupCadres", "Group Cadre models together (Default: On)"));

    const settingsElements = [];
    settings.forEach((setting, index) => {
        settingsElements.push(<IonItem key={index}>{setting}</IonItem>);
    });

    return (
        <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => setIsOpen(false)}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    {settingsElements}
                </IonList>
            </IonContent>
            <IonFooter>
                <IonButton expand="block" onClick={() => saveFileConfirm(settingsFilename, currentUserSettings)}>
                    <div>Save Settings</div>
                </IonButton>
                <IonButton expand="block" onClick={() => saveFileConfirm(settingsFilename, userSettingsDefault)}>
                    <div>Restore Defaults</div>
                </IonButton>
            </IonFooter>
        </IonModal>
    );
}

export default SettingsModal;
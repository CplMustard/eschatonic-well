import React from "react";
import { useLocalStorageState } from "ahooks";
import { IonContent, IonModal, IonHeader, IonFooter, IonToolbar, IonButtons, IonTitle, IonButton, IonList, IonItem, IonToggle, useIonAlert, } from "@ionic/react";

import { saveUserSettings, loadUserSettings } from "../util/fileUtil";
import { userSettingsDefault } from "../data";

let loadedUserSettings = await loadUserSettings();

function SettingsModal (props) {    
    const [presentAlert] = useIonAlert();

    const { isOpen, setIsOpen } = props;

    const [currentUserSettings, setCurrentUserSettings] = useLocalStorageState("currentUserSettings", {defaultValue: loadedUserSettings, listenStorageChange: true});

    const dismissModal = () => {
        setCurrentUserSettings(structuredClone(loadedUserSettings));
        setIsOpen(false);
    };

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
                        try { 
                            saveUserSettings(fileData);
                            loadedUserSettings = fileData;
                            setIsOpen(false);
                        } catch (e) {
                            console.error(e);
                        }
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    };

    const restoreDefaultsConfirm = async () => {
        presentAlert({
            header: "Restore Defaults",
            message: "Restore all settings to default?",
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
                        setCurrentUserSettings(structuredClone(userSettingsDefault));
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
        return <IonToggle key={settingName} checked={currentUserSettings && (currentUserSettings[settingName] !== undefined ? currentUserSettings[settingName] : userSettingsDefault[settingName])} onIonChange={(e) => updateSetting(settingName, e.detail.checked)}>
            <p className="settings-text">
                {settingDescription}
            </p>
            <p>
                {getToggleDefaultText(settingName)}
            </p>
        </IonToggle>;
    };

    const getToggleDefaultText = (settingName) => {
        return `(Default: ${userSettingsDefault[settingName] ? "On" : "Off"})`;
    };

    const settings = [];
    settings.push(createNewToggle("groupCadres", "Group Cadre models together"));
    settings.push(createNewToggle("combineIdenticalWeapons", "Combine identical weapons in statlines, e.g 2x Arc Blade"));

    const settingsElements = [];
    settings.forEach((setting, index) => {
        settingsElements.push(<IonItem key={index}>{setting}</IonItem>);
    });

    return (
        <IonModal isOpen={isOpen} onDidDismiss={() => dismissModal()}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => dismissModal()}>
                            Cancel
                        </IonButton>
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
                <IonButton expand="block" onClick={() => saveFileConfirm(currentUserSettings)}>
                    <div>Save Settings</div>
                </IonButton>
                <IonButton expand="block" onClick={() => restoreDefaultsConfirm()}>
                    <div>Restore Defaults</div>
                </IonButton>
            </IonFooter>
        </IonModal>
    );
}

export default SettingsModal;
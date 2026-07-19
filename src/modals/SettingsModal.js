import React, { useState } from "react";
import sanitize from "sanitize-filename";
import { IonContent, IonModal, IonHeader, IonFooter, IonToolbar, IonButtons, IonTitle, IonButton, IonList, IonItem, IonToggle, useIonAlert, } from "@ionic/react";

var semver = require("semver");

import { settingsFilename, settingsFormatVersion } from "../util/fileUtil";
import { userSettingsDefault } from "./data";

function SettingsModal (props) {    
    const [presentAlert] = useIonAlert();

    const { isOpen, setIsOpen } = props;

    const [fileName, setFileName] = useState(defaultFileName);

    let userSettings = loadUserSettings();

    const saveFileConfirm = async (name, fileData) => {
        let showOverwriteWarning = false;
        const sanitizedFileName = sanitize(name);
        const result = await listFiles(filesPath);
        if(result && result.files) {
            showOverwriteWarning = result.files.find((file) => file.name.replace(fileExtension, "") === sanitizedFileName);
        }
        presentAlert({
            header: `Save Settings`,
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
                        saveFile(sanitizedFileName, ...fileData);
                        setFileName(sanitizedFileName);
                        setIsOpen(false);
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    };

    const updateSetting = (settingName, settingValue) => {
        userSettings[settingName] = settingValue;
    }

    const createNewToggle = (settingName, settingDescription) => {
        return <IonToggle checked={userSettings[settingName] ? userSettings[settingName] : userSettingsDefault[settingName]}> ionChange={(e) => updateSetting(settingName, e.value)}
           {settingDescription}
        </IonToggle>
    }

    settings = [];
    settings.push(createNewToggle("groupCadres", "Group Cadre models together (Default: On)"));

    settingsElements = [];
    settings.forEach((setting) => {
        settingsElements.push(<IonItem>{setting}</IonItem>)
    })

    return (
        <IonModal isOpen={isOpen} onDidDismiss={() => setIsOpen(false)}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => setIsOpen(false)}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>{title}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonList>
                    {settingsElements}
                </IonList>
            </IonContent>
            {!disableSave && <IonFooter>
                <IonButton expand="block" onClick={() => saveFileConfirm(fileName, fileData)}>
                    <div>Save Settings</div>
                </IonButton>
                <IonButton expand="block" onClick={() => saveFileConfirm(fileName, fileData)}>
                    <div>Restore Defaults</div>
                </IonButton>
            </IonFooter>}
        </IonModal>
    );
}

export default SettingsModal;
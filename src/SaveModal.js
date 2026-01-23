import React, { useState } from "react";
import sanitize from "sanitize-filename";
import { IonContent, IonText, IonModal, IonHeader, IonFooter, IonToolbar, IonInput, IonButtons, IonTitle, IonButton, useIonAlert } from "@ionic/react";

function SaveModal (props) {    
    const [presentAlert] = useIonAlert();

    const { isOpen, setIsOpen, title, fileTypeName, fileExtension, filesPath, fileData, listFiles, saveFile } = props;

    const [fileName, setFileName] = useState(`New ${fileTypeName[0].toUpperCase() + fileTypeName.slice(1)}`);

    const saveFileConfirm = async (name, fileData) => {
        let showOverwriteWarning = false;
        const sanitizedFileName = sanitize(name);
        const result = await listFiles(filesPath);
        if(result && result.files) {
            showOverwriteWarning = result.files.find((file) => file.name.replace(fileExtension, "") === sanitizedFileName);
        }
        presentAlert({
            header: `${title}?`,
            message: showOverwriteWarning ? `Overwrite the ${fileTypeName} saved as ${sanitizedFileName}?` : `Save current ${fileTypeName} as ${sanitizedFileName}?`,
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
                        setIsOpen(false);
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    };

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
                <IonText color="primary"><h2>{fileTypeName[0].toUpperCase() + fileTypeName.slice(1)} Name: <IonInput type="text" fill="solid" value={fileName} onIonChange={(e) => setFileName(sanitize(e.target.value))}/></h2></IonText>
            </IonContent>
            <IonFooter>
                <IonButton expand="block" onClick={() => saveFileConfirm(fileName, fileData)}>
                    <div>Save {fileTypeName}</div>
                </IonButton>
            </IonFooter>
        </IonModal>
    );
}

export default SaveModal;
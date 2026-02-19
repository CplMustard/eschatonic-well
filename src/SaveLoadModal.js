import React, { useState } from "react";
import sanitize from "sanitize-filename";
import { IonContent, IonText, IonModal, IonHeader, IonFooter, IonToolbar, IonButtons, IonTitle, IonInput, IonButton, IonIcon, IonGrid, IonCol, IonRow, useIonAlert } from "@ionic/react";
import { warning } from "ionicons/icons";

var semver = require("semver");

import {forcesExtension, forceFormatVersion, rackFormatVersion} from "./EditorView.js";

function SaveLoadModal (props) {    
    const [presentAlert] = useIonAlert();

    const { isOpen, setIsOpen, disableSave, title, fileTypeName, fileExtension, files, filesPath, filterFiles, defaultFileName, fileData, loadFile, deleteFile, listFiles, saveFile } = props;

    const [fileName, setFileName] = useState(defaultFileName);

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

    const loadFileConfirm = (name, filename) => {
        presentAlert({
            header: `Load ${fileTypeName} ${name}?`,
            message: `This action will clear your ${fileTypeName}`,
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
                        loadFile(filename);
                        setIsOpen(false);
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    };

    const deleteFileConfirm = (name, filename) => {
        presentAlert({
            header: `Delete ${fileTypeName} ${name}?`,
            message: `This action will delete this ${fileTypeName} permanently`,
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
                        deleteFile(filename);
                        //Close modal if this file is the last one
                        if(files.length === 1) {
                            setIsOpen(false);
                        }
                    },
                },
            ],
            onDidDismiss: () => {}
        });
    };

    const checkOutOfDateFormat = (file) => {
        if(!file.formatVersion) {
            return true;
        }
        // If we need more than two file formats this will need to change
        const versionToCheck = file.fileInfo.fileExtension === forcesExtension ? forceFormatVersion : rackFormatVersion;
        return semver.ltr(file.formatVersion, versionToCheck);
    };

    const loadFileButtons = [];
    files.forEach((file, index) => {
        const fileName = file.fileInfo.name.replace(fileExtension, "");
        const factionId = file.factionId;
        const isOutOfDate = checkOutOfDateFormat(file);
        if(filterFiles ? filterFiles(file) : true) {
            loadFileButtons.push(<IonRow key={index}>
                <IonCol>
                    <IonButton className={factionId} style={{textTransform: "none", fontWeight: "bold"}}expand="block" onClick={() => loadFileConfirm(fileName, file.fileInfo.name)}>
                        <div>{fileName}</div>
                        {isOutOfDate && <IonIcon icon={warning}></IonIcon>}
                    </IonButton>
                </IonCol>
                {deleteFile && <IonCol size="auto">
                    <IonButton expand="block" onClick={() => deleteFileConfirm(fileName, file.fileInfo.name)}>
                        DELETE
                    </IonButton>
                </IonCol>}
            </IonRow>);
        }
    });


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
                <IonText color="primary"><h2 className="label" style={{marginBottom:"0"}}>Load {fileTypeName[0].toUpperCase() + fileTypeName.slice(1)}:</h2></IonText>
                {files.length !== 0 && <IonGrid>{loadFileButtons}</IonGrid>}
            </IonContent>
            {!disableSave && <IonFooter>
                <IonText color="primary"><h2 className="label">Save {fileTypeName} as: <IonInput type="text" fill="solid" value={fileName} onIonChange={(e) => setFileName(sanitize(e.target.value))}/></h2></IonText>
                <IonButton expand="block" onClick={() => saveFileConfirm(fileName, fileData)}>
                    <div>Save {fileTypeName}</div>
                </IonButton>
            </IonFooter>}
        </IonModal>
    );
}

export default SaveLoadModal;
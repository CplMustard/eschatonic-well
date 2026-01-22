import React from "react";
import { IonContent, IonModal, IonHeader, IonToolbar, IonButtons, IonTitle, IonButton, IonGrid, IonCol, IonRow, useIonAlert } from "@ionic/react";

function LoadModal (props) {    
    const [presentAlert] = useIonAlert();

    const { isOpen, setIsOpen, title, fileTypeName, fileExtension, files, filterFiles, loadFile, deleteFile } = props;

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

    const loadFileButtons = [];
    files.forEach((file, index) => {
        const fileName = file.fileInfo.name.replace(fileExtension, "");
        const factionId = file.factionId;
        if(filterFiles ? filterFiles(file) : true) {
            console.log(factionId);
            loadFileButtons.push(<IonRow key={index}>
                <IonCol>
                    <IonButton className={factionId} expand="block" onClick={() => loadFileConfirm(fileName, file.fileInfo.name)}>
                        <div>{fileName}</div>
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
        <IonModal isOpen={isOpen}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => setIsOpen(false)}>Cancel</IonButton>
                    </IonButtons>
                    <IonTitle>{title}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {files.length !== 0 && <IonGrid>{loadFileButtons}</IonGrid>}
            </IonContent>
        </IonModal>
    );
}

export default LoadModal;
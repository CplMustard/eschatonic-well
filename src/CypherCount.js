import React from "react";
import { IonText} from "@ionic/react";

const minCyphers = 12;
const maxCyphers = 15;
const maxSpecialIssue = 4;

function CypherCount(props) {
    const { cyphers, specialIssue } = props;
    return <>
        <IonText color={cyphers.length > maxCyphers || cyphers.length < minCyphers ? "danger" : "primary"}><h3>Cyphers: {cyphers.length} / {maxCyphers}</h3></IonText>
        {specialIssue.length !== 0 && <IonText color="primary"><h3>Special Issue Cyphers: {specialIssue.length}<span> / {maxSpecialIssue}</span></h3></IonText>}
    </>;
}

export default CypherCount;
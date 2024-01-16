import React from "react";
import { IonText} from "@ionic/react";

import { isHidden } from "./util/isHidden.js";

const maxSpecialIssue = 4;

function ModelCount(props) {
    const {models, specialIssue, maxUnits, freeHeroSolos} = props;

    function countUnits(forceData) {
        return forceData.filter((forceModel) => {        
            return !isHidden(forceModel.modelId);
        }).length - Math.min(countHeroSolos(forceData), freeHeroSolos ? freeHeroSolos : 0);
    }

    function countHeroSolos(forceData) {
        return forceData.filter((forceModel) => {
            const hasHeroSubtype = forceModel.subtypes ? forceModel.subtypes.includes("hero") && !isHidden(forceModel.modelId) : false;
            return forceModel.type === "solo" && hasHeroSubtype;
        }).length;
    }

    const showHeroSoloCount = freeHeroSolos ? (freeHeroSolos !== 0) : false;
    return <>
        <IonText color={countUnits(models) < maxUnits || countUnits(models) > maxUnits ? "danger" : "primary"}><h3>Units: {countUnits(models)}{maxUnits && <span> / {maxUnits}</span>}</h3></IonText>
        {showHeroSoloCount && (<IonText color={countHeroSolos(models) < freeHeroSolos ? "danger" : "primary"}><h3>Free Hero Solos: {`${Math.min(countHeroSolos(models), freeHeroSolos)} / ${freeHeroSolos}`}</h3></IonText>)}
        {specialIssue.length !== 0 && <IonText color="primary"><h3>Special Issue Units: {specialIssue.length}<span> / {maxSpecialIssue}</span></h3></IonText>}
    </>;
}

export default ModelCount;

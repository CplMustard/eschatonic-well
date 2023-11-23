import React from 'react';
import { IonText} from '@ionic/react';

const minCyphers = 12;
const maxCyphers = 15;

function CypherCount(props) {
    const { cyphers } = props;
    return <>
        <IonText color={cyphers.length > maxCyphers || cyphers.length < minCyphers ? "danger" : "primary"}><h3>Cyphers: {cyphers.length} / {maxCyphers}</h3></IonText>
    </>
}

export default CypherCount;
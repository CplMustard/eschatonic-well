import React from 'react';
import { useNavigate } from "react-router-dom";
import { v1 as uuidv1 } from 'uuid';
import { IonText } from '@ionic/react';

import CardList from './CardList';
import ForceCypherList from './ForceCypherList';

import { cyphersData, factionsData } from './data';

const minCyphers = 12;
const maxCyphers = 15;

function CypherCountComponent(props) {
    const { cyphers } = props;
    return <>
        <IonText color={cyphers.length > maxCyphers || cyphers.length < minCyphers ? "danger" : "primary"}><h3>Cyphers: {cyphers.length} / {maxCyphers}</h3></IonText>
    </>
}

function RackEditor(props) {
    const navigate = useNavigate();

    const { factionId, forceCyphersData, setForceCyphersData } = props;

    const cyphers = factionId ? Object.values(cyphersData).filter((cypher) => cypher.factions && (cypher.factions.includes(factionId) || cypher.factions.includes('all'))) : Object.values(cyphersData);

    function cypherCount(cyphersData, cypherId) {
        return cyphersData.filter((forceCypher) => forceCypher.cypherId === cypherId).length;
    }

    function openCypherCard(id) {
        navigate(`/cypher/${id}`);
    }

    function addCypherCards(cypherIds) {
        let newForceCyphersData = forceCyphersData;
        cypherIds.forEach((cypherId) => {
            if(cypherCount(newForceCyphersData, cypherId) === 0) {
                const cypherEntry = {id: uuidv1(), cypherId: cypherId, type: cyphersData[cypherId].type, name: cyphersData[cypherId].name};
                newForceCyphersData = newForceCyphersData.concat(cypherEntry);
            }
        });
        setForceCyphersData(newForceCyphersData);
    }

    function removeCypherCard(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        if(index !== -1) {
            setForceCyphersData([...forceCyphersData.slice(0, index), ...forceCyphersData.slice(index + 1)]);
        }
    }

    const remainingCypherCardList = cyphers.filter((cypher) => forceCyphersData.findIndex((forceCypher) => forceCypher.cypherId === cypher.id) === -1);

    return (
        <div>
            {<IonText color="primary"><h3>Faction: {factionId ? factionsData[factionId].name : "ALL"}</h3></IonText>}

            <CypherCountComponent cyphers={forceCyphersData}/>
            <ForceCypherList header={"Rack"} forceEntries={forceCyphersData} handleCardClicked={openCypherCard} cardActions={[{handleClicked: removeCypherCard, text: "REMOVE"}]} ></ForceCypherList>

            <CardList header={"Cyphers"} cards={remainingCypherCardList} handleCardClicked={openCypherCard} cardActions={[{handleClicked: (cypherId) => addCypherCards([cypherId]), text: "ADD"}]}></CardList>
        </div>
    );
}

export default RackEditor;

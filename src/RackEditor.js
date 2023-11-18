import React from 'react';
import { useNavigate } from "react-router-dom";
import { v1 as uuidv1 } from 'uuid';
import { IonText, IonIcon } from '@ionic/react';
import { add, remove, caretDownOutline, caretUpOutline } from 'ionicons/icons';

import CardList from './CardList';
import ForceCypherList from './ForceCypherList';

import { cyphersData, factionsData } from './data';

const cypherTypeMin = 3;
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

    const { factionId, forceCyphersData, setForceCyphersData, specialIssueCyphersData, setSpecialIssueCyphersData } = props;

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

    function addSpecialIssue(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        let newSpecialIssueCyphersData = specialIssueCyphersData;
        newSpecialIssueCyphersData.push(forceCyphersData[index]);
        removeCypherCard(id);
        setSpecialIssueCyphersData(newSpecialIssueCyphersData);
    }

    function removeSpecialIssue(id) {
        const index = specialIssueCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        addCypherCards([specialIssueCyphersData[index].cypherId]);
        let newSpecialIssueCyphersData = specialIssueCyphersData;
        newSpecialIssueCyphersData = [...newSpecialIssueCyphersData.slice(0, index), ...newSpecialIssueCyphersData.slice(index + 1)]
        setSpecialIssueCyphersData(newSpecialIssueCyphersData);
    }

    function canSpecialIssueSwap(id) {
        const index = forceCyphersData.findIndex((forceCypher) => forceCypher.id === id);
        const cypherType = forceCyphersData[index].type
        return specialIssueCyphersData.filter((forceCypher) => forceCypher.type === cypherType).length !== 0;
    }

    const remainingCypherCardList = cyphers.filter((cypher) => forceCyphersData.findIndex((forceCypher) => forceCypher.cypherId === cypher.id) === -1 && specialIssueCyphersData.findIndex((forceCypher) => forceCypher.cypherId === cypher.id) === -1);

    return (
        <div>
            {<IonText color="primary"><h3>Faction: {factionId ? factionsData[factionId].name : "ALL"}</h3></IonText>}

            <CypherCountComponent cyphers={forceCyphersData}/>
            <ForceCypherList 
                header={"Rack"} 
                forceEntries={forceCyphersData} 
                cypherTypeMin={cypherTypeMin}
                handleCardClicked={openCypherCard} 
                cardActions={[
                    {handleClicked: removeCypherCard, text: <IonIcon slot="icon-only" icon={remove}></IonIcon>},
                    {handleClicked: addSpecialIssue, text: <IonIcon slot="icon-only" icon={caretDownOutline}></IonIcon>, isHidden: canSpecialIssueSwap}
                ]}
            ></ForceCypherList>

            <ForceCypherList 
                header={"Special Issue"} 
                forceEntries={specialIssueCyphersData} 
                handleCardClicked={openCypherCard} 
                cardActions={[
                    {handleClicked: removeSpecialIssue, text: <IonIcon slot="icon-only" icon={caretUpOutline}></IonIcon>}
                ]}
            ></ForceCypherList>

            <CardList 
                header={"Cyphers"} 
                cards={remainingCypherCardList} 
                handleCardClicked={openCypherCard} 
                cardActions={[{handleClicked: (cypherId) => addCypherCards([cypherId]), text: <IonIcon slot="icon-only" icon={add}></IonIcon>}]}
            ></CardList>
        </div>
    );
}

export default RackEditor;

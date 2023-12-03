import React from 'react';
import { useParams, useNavigate } from "react-router-dom";

import CardList from './CardList';

import { cadresData, modelsData } from './data';

function CardListViewer(props) {
    const params = useParams();
    const navigate  = useNavigate();

    const cadreId = props.cadreId ? props.cadreId : params.cadreId;
    const models = Object.values(modelsData).filter((model) => model.cadre && (model.cadre === cadreId));

    function openModelCard(id) {
        navigate(`/model/${id}`);
    }

    return (
        <div className="container">
            <CardList header={`Cadre: ${cadresData[cadreId].name}`} cards={models} handleCardClicked={openModelCard}></CardList>
        </div>
    );
}

export default CardListViewer;
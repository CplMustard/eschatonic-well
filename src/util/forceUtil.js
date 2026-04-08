import { v1 as uuidv1 } from "uuid";

import { isHidden } from "./isHidden.js";

export const modelCount = (forceData, modelId) => {
    return forceData.filter((forceModel) => forceModel.modelId === modelId).length;
};

export const countCadreModels = (forceData, cadreId, cadresData) => {
    if (cadreId) {
        const cadreModels = cadresData[cadreId].models;
        const cadreModelCounts = [];
        cadreModels.forEach((cadreModelId) => cadreModelCounts.push(modelCount(forceData, cadreModelId)));
        return Math.min(...cadreModelCounts);
    }
    return 0;
};

export const addAttachments = (context, forceData, modelData, addedModelNames) => {
    let newForceData = forceData;
    modelData.attachments.forEach((attachment) => {
        if(newForceData.findIndex((forceModel) => forceModel.modelId === attachment) === -1) {
            newForceData = insertModelCard(context, newForceData, attachment, addedModelNames);
        }
    });
    
    return newForceData;
};

export const deleteAttachments = (context, forceData, modelData, deletedModelNames) => {
    const { modelsData } = context;

    let newForceData = forceData;
    modelData.attachments.forEach((attachment) => {
        //only delete if we're the last eligible unit for this attachment
        const attachmentIndex = newForceData.findIndex((forceModel) => forceModel.modelId === attachment);
        const remainingEligibleUnitCount = newForceData.filter((forceModel) => modelsData[forceModel.modelId].attachments && modelsData[forceModel.modelId].attachments.includes(attachment)).length;
        if(attachmentIndex !== -1 && remainingEligibleUnitCount === 0) {
            newForceData = deleteModelCard(context, newForceData, attachmentIndex, deletedModelNames);
        }
    });
    return newForceData;
};

export const addCadreChampion = (context, forceData, cadreId, addedModelNames) => {
    const { cadresData } = context;

    let newForceData = forceData;
    const cadre = cadresData[cadreId];
    //add a champion for this cadre if the count doesn't match
    if(modelCount(newForceData, cadre.champion) !== countCadreModels(newForceData, cadreId, cadresData)) {
        newForceData = insertModelCard(context, newForceData, cadre.champion, addedModelNames);
    }
    return newForceData;
};

export const deleteCadreChampion = (context, forceData, cadreId, deletedModelNames) => {
    const { cadresData } = context;

    let newForceData = forceData;
    const cadre = cadresData[cadreId];
    //remove a champion for this cadre if the count doesn't match
    if(modelCount(newForceData, cadre.champion) !== countCadreModels(newForceData, cadreId, cadresData)) {
        const championIndex = newForceData.findIndex((forceModel) => forceModel.modelId === cadre.champion);
        newForceData = deleteModelCard(context, newForceData, championIndex, deletedModelNames);
    }
    return newForceData;
};

export const insertModelCard = (context, forceData, modelId, addedModelNames) => {
    const { rulesetId, modelsData, weaponsData } = context;

    let newForceData = forceData;
    const newId = uuidv1();
    const modelData = modelsData[modelId];
    const defaultHardPoints = [];
    if(modelData.hard_points) {
        modelData.hard_points.forEach((hard_point) => {
            defaultHardPoints.push({type: hard_point.type, option: hard_point.options[0], point_cost: hard_point.type === "weapon" ? weaponsData[hard_point.options[0]].point_cost : 0});
        }, [weaponsData]);
    }
    if (modelData.attachments) {
        newForceData = addAttachments(context, newForceData, modelData, addedModelNames);
    }
    
    const canRemove = !isHidden(modelId, rulesetId);
    const forceEntry = {id: newId, modelId: modelId, name: modelData.name, type: modelData.type, subtypes: modelData.subtypes, factions: modelData.factions, cadre: modelData.cadre, canRemove: canRemove, weapon_points: modelData.weapon_points, hard_points: modelData.hard_points, hardPointOptions: defaultHardPoints};
    addedModelNames.push(modelData.name);
    newForceData = newForceData.concat(forceEntry);

    if (modelData.cadre) {
        newForceData = addCadreChampion(context, newForceData, modelData.cadre, addedModelNames);
    }

    return newForceData;
};

export const deleteModelCard = (context, forceData, index, deletedModelNames) => {
    const { modelsData } = context;

    let newForceData = forceData;
    const modelId = newForceData[index].modelId;
    const modelData = modelsData[modelId];
    newForceData = [...newForceData.slice(0, index), ...newForceData.slice(index + 1)];
    deletedModelNames.push(modelData.name);
    if (modelData.attachments) {
        newForceData = deleteAttachments(context, newForceData, modelData, deletedModelNames);
    }

    if(modelData.cadre) {
        newForceData = deleteCadreChampion(context, newForceData, modelData.cadre, deletedModelNames);
    }

    return newForceData;
};
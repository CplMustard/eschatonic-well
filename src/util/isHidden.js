
import { getModelsData, getModelTypesData } from "./../data";

export function isHidden(modelId) {
    const modelData = getModelsData()[modelId];
    const hasHiddenType = getModelTypesData()[modelData.type].hidden;
    const hasHiddenSubtype = modelData.subtypes ? modelData.subtypes.some((subtype) => getModelTypesData()[subtype].hidden) : false;
    return (hasHiddenType || hasHiddenSubtype || modelData.hidden);
}
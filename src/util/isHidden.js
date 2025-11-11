
import { getModelsData, getModelTypesData } from "../DataLoader";

export function isHidden(modelId, ruleset) {
    const modelData = getModelsData(ruleset)[modelId];
    const hasHiddenType = getModelTypesData(ruleset)[modelData.type].hidden;
    const hasHiddenSubtype = modelData.subtypes ? modelData.subtypes.some((subtype) => getModelTypesData(ruleset)[subtype].hidden) : false;
    return (hasHiddenType || hasHiddenSubtype || modelData.hidden);
}
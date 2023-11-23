
import { modelsData, modelTypesData } from './../data';

function isHidden(modelId) {
    const modelData = modelsData[modelId];
    const hasHiddenType = modelTypesData[modelData.type].hidden;
    const hasHiddenSubtype = modelData.subtypes ? modelData.subtypes.some((subtype) => modelTypesData[subtype].hidden) : false;
    return (hasHiddenType || hasHiddenSubtype || modelData.hidden);
}

export default isHidden;
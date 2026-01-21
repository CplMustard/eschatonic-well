import { ppData, vancasterData } from "./data";

const base = {
    cadresData : {},
    cortexesData : {},
    cyphersData : {},
    cypherTypesData : {},
    damageTypesData : {},
    factionsData : {},
    forceSizesData : {},
    maneuversData : {},
    modelsData : {},
    modelTypesData : {},
    specialRulesData : {},
    weaponsData : {}
};

const rulesets = {
    pp: { id: "pp", name: "Privateer Press", data: ppData },
    vancaster: { id: "vancaster", name: "Van-caster", data: vancasterData }
};

const getRulesetData = (rulesetId) => {
    const ruleset = rulesets[rulesetId];
    return ruleset ? ruleset.data : base;
};

const getCadresData = (rulesetId) => Object.assign(base.cadresData, getRulesetData(rulesetId).cadresData);
const getCortexesData = (rulesetId) => Object.assign(base.cortexesData, getRulesetData(rulesetId).cortexesData);
const getCyphersData = (rulesetId) => Object.assign(base.cyphersData, getRulesetData(rulesetId).cyphersData);
const getCypherTypesData = (rulesetId) => Object.assign(base.cypherTypesData, getRulesetData(rulesetId).cypherTypesData);
const getDamageTypesData = (rulesetId) => Object.assign(base.damageTypesData, getRulesetData(rulesetId).damageTypesData);
const getFactionsData = (rulesetId) => Object.assign(base.factionsData, getRulesetData(rulesetId).factionsData);
const getForceSizesData = (rulesetId) => Object.assign(base.forceSizesData, getRulesetData(rulesetId).forceSizesData);
const getManeuversData = (rulesetId) => Object.assign(base.maneuversData, getRulesetData(rulesetId).maneuversData);
const getModelsData = (rulesetId) => Object.assign(base.modelsData, getRulesetData(rulesetId).modelsData);
const getModelTypesData = (rulesetId) => Object.assign(base.modelTypesData, getRulesetData(rulesetId).modelTypesData);
const getSpecialRulesData = (rulesetId) => Object.assign(base.specialRulesData, getRulesetData(rulesetId).specialRulesData);
const getWeaponsData = (rulesetId) => Object.assign(base.weaponsData, getRulesetData(rulesetId).weaponsData);

export {
    getCadresData,
    getCortexesData,
    getCyphersData,
    getCypherTypesData,
    getDamageTypesData,
    getFactionsData,
    getForceSizesData,
    getManeuversData,
    getModelsData,
    getModelTypesData,
    getSpecialRulesData,
    getWeaponsData,
    rulesets
};
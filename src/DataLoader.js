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
    pp: { id: "pp", name: "Privateer Press", data: base },
    vancaster: { id: "vancaster", name: "Van-caster", data: vancasterData }
};

const getRulesetData = (rulesetId) => {
    const rulesetData = Object.keys(rulesets).find((ruleset) => ruleset.id === rulesetId);
    return rulesetData ? rulesetData : base;
};

const getCadresData = (rulesetId) => Object.assign(ppData.cadresData, getRulesetData(rulesetId).cadresData);
const getCortexesData = (rulesetId) => Object.assign(ppData.cortexesData, getRulesetData(rulesetId).cortexesData);
const getCyphersData = (rulesetId) => Object.assign(ppData.cyphersData, getRulesetData(rulesetId).cyphersData);
const getCypherTypesData = (rulesetId) => Object.assign(ppData.cypherTypesData, getRulesetData(rulesetId).cypherTypesData);
const getDamageTypesData = (rulesetId) => Object.assign(ppData.damageTypesData, getRulesetData(rulesetId).damageTypesData);
const getFactionsData = (rulesetId) => Object.assign(ppData.factionsData, getRulesetData(rulesetId).factionsData);
const getForceSizesData = (rulesetId) => Object.assign(ppData.forceSizesData, getRulesetData(rulesetId).forceSizesData);
const getManeuversData = (rulesetId) => Object.assign(ppData.maneuversData, getRulesetData(rulesetId).maneuversData);
const getModelsData = (rulesetId) => Object.assign(ppData.modelsData, getRulesetData(rulesetId).modelsData);
const getModelTypesData = (rulesetId) => Object.assign(ppData.modelTypesData, getRulesetData(rulesetId).modelTypesData);
const getSpecialRulesData = (rulesetId) => Object.assign(ppData.specialRulesData, getRulesetData(rulesetId).specialRulesData);
const getWeaponsData = (rulesetId) => Object.assign(ppData.weaponsData, getRulesetData(rulesetId).weaponsData);

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
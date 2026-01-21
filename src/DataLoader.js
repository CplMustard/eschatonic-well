import { ppData, vancasterData } from "./data";

const rulesets = {
    pp: { id: "pp", name: "Privateer Press", data: ppData },
    vancaster: { id: "vancaster", name: "Remix", data: vancasterData }
};

const getRulesetData = (rulesetId) => {
    const ruleset = rulesets[rulesetId] ? rulesets[rulesetId] : rulesets.pp;
    return ruleset.data;
};

const getCadresData = (rulesetId) => getRulesetData(rulesetId).cadresData;
const getCortexesData = (rulesetId) => getRulesetData(rulesetId).cortexesData;
const getCyphersData = (rulesetId) => getRulesetData(rulesetId).cyphersData;
const getCypherTypesData = (rulesetId) => getRulesetData(rulesetId).cypherTypesData;
const getDamageTypesData = (rulesetId) => getRulesetData(rulesetId).damageTypesData;
const getFactionsData = (rulesetId) => getRulesetData(rulesetId).factionsData;
const getForceSizesData = (rulesetId) => getRulesetData(rulesetId).forceSizesData;
const getManeuversData = (rulesetId) => getRulesetData(rulesetId).maneuversData;
const getModelsData = (rulesetId) => getRulesetData(rulesetId).modelsData;
const getModelTypesData = (rulesetId) => getRulesetData(rulesetId).modelTypesData;
const getSpecialRulesData = (rulesetId) => getRulesetData(rulesetId).specialRulesData;
const getWeaponsData = (rulesetId) => getRulesetData(rulesetId).weaponsData;

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
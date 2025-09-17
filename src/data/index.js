import {
    cadresData as cadresDataPP,
    cortexesData as cortexesDataPP,
    cyphersData as cyphersDataPP,
    cypherTypesData as cypherTypesDataPP,
    damageTypesData as damageTypesDataPP,
    factionsData as factionsDataPP,
    forceSizesData as forceSizesDataPP,
    maneuversData as maneuversDataPP,
    modelsData as modelsDataPP,
    modelTypesData as modelTypesDataPP,
    specialRulesData as specialRulesDataPP,
    weaponsData as weaponsDataPP
} from "./pp";

import {
    cortexesData as cortexesDataVancaster,
    cyphersData as cyphersDataVancaster,
    maneuversData as maneuversDataVancaster,
    modelsData as modelsDataVancaster,
    specialRulesData as specialRulesDataVancaster,
    weaponsData as weaponsDataVancaster
} from "./vancaster";

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

const vancaster = {
    cadresData : {},
    cortexesData : cortexesDataVancaster,
    cyphersData : cyphersDataVancaster,
    cypherTypesData : {},
    damageTypesData : {},
    factionsData : {},
    forceSizesData : {},
    maneuversData : maneuversDataVancaster,
    modelsData : modelsDataVancaster,
    modelTypesData : {},
    specialRulesData : specialRulesDataVancaster,
    weaponsData : weaponsDataVancaster
};

const rulesets = {
    pp: { id: "pp", name: "Privateer Press", data: base },
    vancaster: { id: "vancaster", name: "Van-caster", data: vancaster }
};

let ruleset = {};

const setRuleset = (rulesetId) => {
    ruleset = rulesets[rulesetId].data;
};

const getCadresData = () => Object.assign(cadresDataPP, ruleset.cadresData);
const getCortexesData = () => Object.assign(cortexesDataPP, ruleset.cortexesData);
const getCyphersData = () => Object.assign(cyphersDataPP, ruleset.cyphersData);
const getCypherTypesData = () => Object.assign(cypherTypesDataPP, ruleset.cypherTypesData);
const getDamageTypesData = () => Object.assign(damageTypesDataPP, ruleset.damageTypesData);
const getFactionsData = () => Object.assign(factionsDataPP, ruleset.factionsData);
const getForceSizesData = () => Object.assign(forceSizesDataPP, ruleset.forceSizesData);
const getManeuversData = () => Object.assign(maneuversDataPP, ruleset.maneuversData);
const getModelsData = () => Object.assign(modelsDataPP, ruleset.modelsData);
const getModelTypesData = () => Object.assign(modelTypesDataPP, ruleset.modelTypesData);
const getSpecialRulesData = () => Object.assign(specialRulesDataPP, ruleset.specialRulesData);
const getWeaponsData = () => Object.assign(weaponsDataPP, ruleset.weaponsData);

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
    setRuleset,
    rulesets
};
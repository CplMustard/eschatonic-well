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

const ppData = {
    cadresData : cadresDataPP,
    cortexesData : cortexesDataPP,
    cyphersData : cyphersDataPP,
    cypherTypesData : cypherTypesDataPP,
    damageTypesData : damageTypesDataPP,
    factionsData : factionsDataPP,
    forceSizesData : forceSizesDataPP,
    maneuversData : maneuversDataPP,
    modelsData : modelsDataPP,
    modelTypesData : modelTypesDataPP,
    specialRulesData : specialRulesDataPP,
    weaponsData : weaponsDataPP
};

const vancasterData = {
    cadresData : ppData.cadresData,
    cortexesData : Object.assign({}, ppData.cortexesData, cortexesDataVancaster),
    cyphersData : Object.assign({}, ppData.cyphersData, cyphersDataVancaster),
    cypherTypesData : ppData.cypherTypesData,
    damageTypesData : ppData.damageTypesData,
    factionsData : ppData.factionsData,
    forceSizesData : ppData.forceSizesData,
    maneuversData : Object.assign({}, ppData.maneuversData, maneuversDataVancaster),
    modelsData : Object.assign({}, ppData.modelsData, modelsDataVancaster),
    modelTypesData : ppData.modelTypesData,
    specialRulesData : Object.assign({}, ppData.specialRulesData, specialRulesDataVancaster),
    weaponsData : Object.assign({}, ppData.weaponsData, weaponsDataVancaster)
};

export {
    ppData,
    vancasterData
};
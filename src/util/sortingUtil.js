import { cypherTypesData, modelTypesData } from '../data';

export const cardSorting = (a, b) => {
    if (a.factions.length > 1 && b.factions.length === 1) return 1;
    if (a.factions.length === 1 && b.factions.length > 1) return -1;
    if (a.factions[0] === "all" && b.factions[0] !== "all") return -1;
    if (a.factions[0] !== "all" && b.factions[0] === "all") return 1;
    if (a.factions[0] > b.factions[0]) return 1;
    if (a.factions[0] < b.factions[0]) return -1;
    return a.name > b.name;
};

export const groupSorting = (a, b) => {
    const typeA = a[0].split("|")[0];
    const typeB = b[0].split("|")[0];
    const isHiddenA = modelTypesData[typeA] ? modelTypesData[typeA].hidden : cypherTypesData[typeA].hidden;
    const isHiddenB = modelTypesData[typeB] ? modelTypesData[typeB].hidden : cypherTypesData[typeB].hidden;
    if(isHiddenA && !isHiddenB) return 1;
    if(!isHiddenA && isHiddenB) return 1;
    return (b[0] < a[0]);
};
import { cypherTypesData, modelTypesData } from '../data';

export const cardSorting = (a, b) => {
    // wildcards should be sorted at the bottom in alphabetical order
    if (a.factions.length > 1 && b.factions.length === 1) return 1;
    if (a.factions.length === 1 && b.factions.length > 1) return -1;
    if (a.factions.length > 1 && b.factions.length > 1) return a.name.localeCompare(b.name);
    // if a card is universal it should be at the top of its category
    if (a.factions[0] === "all" && b.factions[0] !== "all") return -1;
    if (a.factions[0] !== "all" && b.factions[0] === "all") return 1;
    // sort by faction id
    if (a.factions[0] > b.factions[0]) return 1;
    if (a.factions[0] < b.factions[0]) return -1;
    // sort by alphabetical order
    return a.name.localeCompare(b.name);
};

export const groupSorting = (a, b) => {
    const typeA = a[0].split("|")[0];
    const typeB = b[0].split("|")[0];
    const isHiddenA = modelTypesData[typeA] ? modelTypesData[typeA].hidden : cypherTypesData[typeA].hidden;
    const isHiddenB = modelTypesData[typeB] ? modelTypesData[typeB].hidden : cypherTypesData[typeB].hidden;
    // sort hidden types at the bottom
    if(!isHiddenA && isHiddenB) return -1;
    if(isHiddenA && !isHiddenB) return 1;
    // sort groups by alphabetical order
    return a[0].localeCompare(b[0]);
};
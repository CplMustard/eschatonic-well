export const getHardPointOptions = (hard_points, hardPointOptions, typeId) => {
    return hard_points && hardPointOptions ? hardPointOptions.filter((hardPointOption) => hardPointOption.type === typeId).map((hardPointOption) => hardPointOption.option) : undefined;
};

export const getAllWeapons = (hard_points, weapons, hardPointWeaponOptions) => {
    return hard_points && hardPointWeaponOptions ? weapons.concat(hardPointWeaponOptions) : weapons;
};

export const getAllSpecialRules = (cadresData, special_rules, cadre, type) => {
    let all_special_rules = special_rules ? special_rules : [];
    if(cadresData && cadre) {
        all_special_rules = ["cadre|" + cadresData[cadre].name].concat(all_special_rules);
    }
    if(type === "void_gate") {
        all_special_rules = ["void_gate"].concat(all_special_rules);
    }
    if(type === "mantlet") {
        all_special_rules = ["mantlet"].concat(all_special_rules);
    }
    return all_special_rules;
};

export const collectSpecialRuleChanges = (specialRulesData, collectedChanges, special_rules) => {
    special_rules.forEach((special_rule) => {
        const ruleParts = special_rule.split("|");
        const ruleId = ruleParts.shift(); //don't include template strings in ID
        const ruleArguments = ruleParts;

        const ruleData = specialRulesData[ruleId];

        let ruleTitleString = `${ruleData.name}: `;
        ruleArguments.forEach((argument, index) => {
            ruleTitleString = ruleTitleString.replaceAll(`{${index}}`, argument);
        });
        if(ruleData.changes) collectedChanges.push({source: ruleTitleString, changes: ruleData.changes});
        if(ruleData.subrules) {
            collectSpecialRuleChanges(specialRulesData, collectedChanges, ruleData.subrules);
        }
    });
};

export const collectChanges = (context, card, hardPointOptions) => {
    const { cadresData, cortexesData, maneuversData, specialRulesData, weaponsData } = context;
    const { name, changes, weapons, advantages, cadre, type, special_rules, hard_points, maneuvers } = card;
    const collectedChanges = [];

    const hardPointWeaponOptions = hardPointOptions && getHardPointOptions(hard_points, hardPointOptions, "weapon");
    const hardPointCortexOption = hardPointOptions && getHardPointOptions(hard_points, hardPointOptions, "cortex");
    const allWeapons = getAllWeapons(hard_points, weapons, hardPointWeaponOptions);
    const all_special_rules = special_rules && getAllSpecialRules(cadresData, special_rules, cadre, type);

    if (changes) collectedChanges.push({source: name, changes: changes});
    

    if (allWeapons) {
        allWeapons.forEach((weapon) => {
            const weaponData = weaponsData[weapon];
            if(weaponData.changes) collectedChanges.push({source: weaponData.name, changes: weaponData.changes});
            if(weaponData.special_rules) {
                collectSpecialRuleChanges(specialRulesData, collectedChanges, weaponData.special_rules);
            }
            if(weaponData.profiles) {
                weaponData.profiles.forEach((profile) => {
                    if(profile.special_rules) {
                        collectSpecialRuleChanges(specialRulesData, collectedChanges, profile.special_rules);
                    }
                });
            }
        });
    }

    if (hardPointCortexOption) {
        const cortexData = cortexesData[hardPointCortexOption[0]];
        if (cortexData) {
            if(cortexData.changes) collectedChanges.push({source: cortexData.name, changes: cortexData.changes});
            if(cortexData.special_rules) {
                collectSpecialRuleChanges(specialRulesData, collectedChanges, cortexData.special_rules);
            }
        }
    }

    if (advantages) {
        collectSpecialRuleChanges(specialRulesData, collectedChanges, advantages);
    }

    if (all_special_rules) {
        collectSpecialRuleChanges(specialRulesData, collectedChanges, all_special_rules);
    }

    if (maneuvers) {
        maneuvers.forEach((maneuver) => {
            const maneuverData = maneuversData[maneuver];
            if(maneuverData.changes) collectedChanges.push({source: maneuverData.name, changes: maneuverData.changes});
        });
    }

    let filteredCollectedChanges = [...new Set(collectedChanges.map(JSON.stringify))].map(JSON.parse);

    return filteredCollectedChanges;
};

export const previewStats = (card) => {
    const { stats } = card;
    return `${stats.spd ? `Spd: ${stats.spd}` : ""} ${stats.mat ? `Mat: ${stats.mat}` : ""} ${stats.rat ? `Rat: ${stats.rat}` : ""} ${stats.def ? `Def: ${stats.def}` : ""} ${stats.arm ? `Arm: ${stats.arm}` : ""} ${stats.foc ? `Foc: ${stats.foc}` : ""}`;
};
const rankTiers = [
    { minLevel: 1, title: "Beginner" },
    { minLevel: 5, title: "Disciplined" },
    { minLevel: 10, title: "Warrior" },
    { minLevel: 20, title: "Elite" },
    { minLevel: 35, title: "Legend" },
    { minLevel: 50, title: "Mythic" },
];

const getXpRequiredForLevel = (level) => {
    return Math.floor(100 * Math.pow(level, 1.35));
};

const calculateLevelFromXp = (xp) =>{
    let level =1;
    let remainingXp = xp;

    while(remainingXp >= getXpRequiredForLevel(level)){
        remainingXp -= getXpRequiredForLevel(level);
        level += 1;
    }

    return {
        level, 
        currentLevelXp: remainingXp,
        nextLevelXp: getXpRequiredForLevel(level),
        progressPercent: Math.round((remainingXp / getXpRequiredForLevel(level)) * 100),
    };
};

const getRankTitle = (level) => {
    let rank = rankTiers[0].title;

    rankTiers.forEach((tier) => {
        if(level >= tier.minLevel)
            rank = tier.title;
    });
    return rank;
};

const applyLevelProgress = (user, xpToAdd) =>{
    const previousXp = user.xp;
    const previousLevel = user.level;

    const newTotalXp = previousXp + xpToAdd;
    const levelData = calculateLevelFromXp(newTotalXp);
    const rankTitle = getRankTitle(levelData.level);

    user.xp = newTotalXp;
    user.level = levelData.level;
    user.rankTitle = rankTitle;


    return {
        previousXp,
        previousLevel,
        newTotalXp,
        newLevel : levelData.level,
        rankTitle,
        leveledUp : levelData.level > previousLevel,
        currentLevelXp: levelData.currentLevelXp,
        nextLevelXp: levelData.nextLevelXp,
        progressPercent: levelData.progressPercent,
    };
};

module.exports = {
    getXpRequiredForLevel,
    calculateLevelFromXp,
    getRankTitle,
    applyLevelProgress,
};

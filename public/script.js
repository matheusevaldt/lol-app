// Global variables.
const searchSummoner = document.querySelector('.search-summoner');
const overviewSummoner = document.querySelector('.overview-summoner');
const inputSearchSummoner = document.querySelector('.input-search-summoner');
const buttonSearchSummoner = document.querySelector('.button-search-summoner');
const summonerRegion = document.querySelector('.summoner-region');
const loadingSearchSummoner = document.querySelector('.loading-search-summoner');
const guideUser = document.querySelector('.guide-user');
const buttonReturnToSearchSummoner = document.querySelector('.button-return-to-search-summoner');
const summonerInfo = document.querySelector('.summoner-info');
const loadingSummonerInfo = document.querySelector('.loading-summoner-info');
const buttons = document.querySelector('.buttons');
const buttonRanked = document.querySelector('.button-ranked');
const buttonChampionMastery = document.querySelector('.button-champion-mastery');
const buttonMatchHistory = document.querySelector('.button-match-history');
const ranked = document.querySelector('.ranked');
const championMastery = document.querySelector('.champion-mastery');
const matchHistory = document.querySelector('.match-history');
const rankedSolo = document.querySelector('.ranked-solo');
const rankedFlex = document.querySelector('.ranked-flex');
const rankedSoloEmblem = document.querySelector('.ranked-solo-emblem');
const rankedFlexEmblem = document.querySelector('.ranked-flex-emblem');
const rankedSoloElo = document.querySelector('.ranked-solo-elo');
const rankedFlexElo = document.querySelector('.ranked-flex-elo');
const rankedSoloLeaguePointsWinRate = document.querySelector('.ranked-solo-league-points-win-rate');
const rankedFlexLeaguePointsWinRate = document.querySelector('.ranked-flex-league-points-win-rate');
const moreMasteries = document.querySelector('.more-masteries');
const loadingMoreMasteries = document.querySelector('.loading-more-masteries');
const buttonLoadMoreMasteries = document.querySelector('.button-load-more-masteries');
const noMoreMasteries = document.querySelector('.no-more-masteries');
const moreMatches = document.querySelector('.more-matches');
const loadingMoreMatches = document.querySelector('.loading-more-matches');
const buttonLoadMoreMatches = document.querySelector('.button-load-more-matches');
const noMoreMatches = document.querySelector('.no-more-matches');
const notifyError = document.querySelector('.notify-error');
const errorDescription = document.querySelector('.error-description');
const buttonScrollToTop = document.querySelector('.button-scroll-to-top');
const scrollToTopImage = document.querySelector('.scroll-to-top-image');
let ACCOUNT_ID;
let SUMMONER_ID;
let SUMMONER_NAME;
let CURRENT_VERSION;
let CHAMPIONS_DATA;
let SPELLS_DATA; 
let RUNES_DATA;
let QUEUES_DATA;
let CHAMPION_MASTERY;
let CHAMPION_MASTERY_RANK;
let MASTERIES_START_INDEX;
let MASTERIES_END_INDEX;
let MASTERIES_COUNT;
let MATCH_HISTORY;
let MATCHES_START_INDEX;
let MATCHES_END_INDEX;
let MATCHES_COUNT;
let arrayMatches = [];
let arrayChampionMastery = [];
let errorInFunction = 'background-color: #d7385e; color: #fff;';

buttonSearchSummoner.disabled = true;

// Event listeners.
inputSearchSummoner.addEventListener('input', statusButtonSearchSummoner);
buttonSearchSummoner.addEventListener('click', event => event.preventDefault());
buttonSearchSummoner.addEventListener('click', fetchSummonerData);
buttonRanked.addEventListener('click', fetchRankedData);
buttonChampionMastery.addEventListener('click', fetchChampionMastery);
buttonMatchHistory.addEventListener('click', fetchMatchHistory);
buttonReturnToSearchSummoner.addEventListener('click', returnToSearchSummoner);

// Fetching the API's current version when the document is loaded.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchCurrentVersion);
} else {
    fetchCurrentVersion();
}

async function fetchCurrentVersion() {
    try {
        const versionURL = 'https://ddragon.leagueoflegends.com/api/versions.json';
        const versionResponse = await fetch(versionURL);
        const versionData = await versionResponse.json();
        CURRENT_VERSION = versionData[0];
        console.log(`Version: ${CURRENT_VERSION}`);
    } catch (err) {
        console.log('Error in function %cfetchCurrentVersion', errorInFunction);
        console.error(err);
    }
}

function statusButtonSearchSummoner() {
    if (inputSearchSummoner.value.length !== 0) {
        buttonSearchSummoner.disabled = false;
        buttonSearchSummoner.classList.add('button-search-summoner-enabled');
    } else {
        buttonSearchSummoner.disabled = true;
        buttonSearchSummoner.classList.remove('button-search-summoner-enabled');
    }
}

// Fetching data from the summoner that the user has inserted.
// Fetching data from the API regarding champions, spells, runes and queues. 
async function fetchSummonerData() {
    try {
        searchSummoner.style.display = 'none';
        notifyError.style.display = 'none';
        errorDescription.innerHTML = '';
        loadingSearchSummoner.style.display = 'block';
        const summoner = encodeURI(inputSearchSummoner.value);
        const region = summonerRegion.options[summonerRegion.selectedIndex].value;
        const server = summonerRegion.options[summonerRegion.selectedIndex].text;
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                summoner: summoner,
                region: region
            })
        };
        const summonerResponse = await fetch('/', options);
        const summonerData = await summonerResponse.json();
        if (summonerData[0] === 'Error') {
            setTimeout(() => {
                loadingSearchSummoner.style.display = 'none';
                searchSummoner.style.display = 'grid';
                summonerInfo.style.display = 'block';
                buttons.style.display = 'none';
                notifyError.style.display = 'block';
                inputSearchSummoner.value = '';
                if (summonerData[1] === '404') {
                    errorDescription.innerHTML = `
                    Summoner hasn't been found. <br>
                    Verify if you've correctly inserted both the summoner's name and region.
                    `;
                } else {
                    errorDescription.innerHTML = `We were unable to fetch and display the information that you've requested.`;
                }
            }, 300);
            return;
        }
        ACCOUNT_ID = summonerData.accountId;
        SUMMONER_ID = summonerData.id;
        SUMMONER_NAME = summonerData.name;
        await displaySummonerOverview(summonerData, server);
        const championsData = await fetchChampionsData();
        const spellsData = await fetchSpellsData();
        const runesData = await fetchRunesData();
        const queuesData = await fetchQueuesData();
        const necessaryData = await Promise.all([championsData, spellsData, runesData, queuesData]);
        return necessaryData;
    } catch (err) {
        console.log('Error in function %cfetchSummonerData', errorInFunction);
        console.error(err);
    }
}

// Displaying an overview of the summoner that the user has inserted.
// Displaying the buttons where the user can look into more information about the summoner.
async function displaySummonerOverview(data, server) {
    loadingSearchSummoner.style.display = 'none';
    overviewSummoner.style.display = 'block';
    summonerInfo.style.display = 'block';
    buttons.style.display = 'grid';
    guideUser.style.display = 'block';
    const overviewIcon = document.querySelector('.overview-icon');
    const overviewLevel = document.querySelector('.overview-level');
    const overviewName = document.querySelector('.overview-name');
    const overviewServer = document.querySelector('.overview-server');
    overviewIcon.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/profileicon/${data.profileIconId}.png`;
    overviewLevel.innerHTML = data.summonerLevel;
    overviewName.innerHTML = data.name;
    overviewServer.innerHTML = server;
}

async function fetchChampionsData() {
    try {
        const championsURL = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/data/en_US/champion.json`;
        const championsResponse = await fetch(championsURL);
        const championsData = await championsResponse.json();
        CHAMPIONS_DATA = championsData.data;
    } catch (err) {
        console.log('Error in function %cfetchChampionsData', errorInFunction);
        console.error(err);
    }
}

async function fetchSpellsData() {
    try {
        const spellsURL = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/data/en_US/summoner.json`;
        const spellsResponse = await fetch(spellsURL);
        const spellsData = await spellsResponse.json();
        SPELLS_DATA = spellsData.data;
    } catch (err) {
        console.log('Error in function %cfetchSpellsData', errorInFunction);
        console.error(err);
    }
}

async function fetchRunesData() {
    try {
        const runesURL = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/data/en_US/runesReforged.json`;
        const runesResponse = await fetch(runesURL);
        const runesData = await runesResponse.json();
        RUNES_DATA = runesData;
    } catch (err) {
        console.log('Error in function %cfetchRunesData', errorInFunction);
        console.error(err);
    }
}

async function fetchQueuesData() {
    try {
        const queuesURL = 'https://static.developer.riotgames.com/docs/lol/queues.json';
        const queuesResponse = await fetch(queuesURL);
        const queuesData = await queuesResponse.json();
        QUEUES_DATA = queuesData;
    } catch (err) {
        console.log('Error in function %cfetchQueuesData', errorInFunction);
        console.error(err);
    }
}

function resetButtonsBackgroundColor() {
    buttonRanked.style.backgroundColor = '#5d54a4';
    buttonChampionMastery.style.backgroundColor = '#5d54a4';
    buttonMatchHistory.style.backgroundColor = '#5d54a4';
}

function resetSummonerInfo() {
    ranked.style.display = 'none';
    championMastery.style.display = 'none';
    matchHistory.style.display = 'none';
    guideUser.style.display = 'none';
    notifyError.style.display = 'none';
    errorDescription.innerHTML = '';
}

function returnToSearchSummoner() {
    inputSearchSummoner.value = '';
    searchSummoner.style.display = 'grid';
    overviewSummoner.style.display = 'none';
    summonerInfo.style.display = 'none';
    ranked.style.display = 'none';
    championMastery.style.display = 'none';
    matchHistory.style.display = 'none';
    buttonSearchSummoner.disabled = true;
    buttonSearchSummoner.classList.remove('button-search-summoner-enabled');
    resetButtonsBackgroundColor();
}

// Fetching ranked data from the summoner that the user has inserted.
async function fetchRankedData() {
    try {
        resetButtonsBackgroundColor();
        resetSummonerInfo();
        resetRanked();
        buttonRanked.style.backgroundColor = 'rgba(93, 84, 164, 0.5)';
        loadingSummonerInfo.style.display = 'block';
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                summonerId: SUMMONER_ID
            })
        };
        const response = await fetch('/ranked', options);
        const data = await response.json();
        if (data[0] === 'Error') {
            setTimeout(() => {
                loadingSummonerInfo.style.display = 'none';
                notifyError.style.display = 'block';
                errorDescription.innerHTML = `We were unable to fetch and display the information that you've requested.`;
            }, 300);
            return;
        }
        await displayRanked(data);
    } catch (err) {
        console.log('Error in function %cfetchSummonerRankedData', errorInFunction);
        console.error(err);
    }
}

// Displaying the ranked data in the document.
async function displayRanked(data) {
    loadingSummonerInfo.style.display = 'none';
    ranked.style.display = 'flex';
    data.map(queue => {
        if (queue.queueType === 'RANKED_SOLO_5x5') {
            const rawRankedSolo = queue.tier;
            const rankedSoloFirstCharacter = rawRankedSolo.charAt(0);
            const rankedSoloFromSecondCharacter = rawRankedSolo.slice(1).toLowerCase();
            const rankedSoloFixed = rankedSoloFirstCharacter + rankedSoloFromSecondCharacter;
            let rankedSoloDivision = queue.rank;
            if (rankedSoloFixed === 'Master' || rankedSoloFixed === 'Grandmaster' || rankedSoloFixed === 'Challenger') rankedSoloDivision = '';
            rankedSoloElo.innerHTML = `
            <strong style="font-size: 0.9em">${rankedSoloFixed} ${rankedSoloDivision}</strong> 
            <span class="small-circle" style="margin: 0 2px"></span> 
            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.85em">Ranked Solo</span>
            `;
            let RANKED_SOLO_WIN_RATE_COLOR;
            const getRankedSoloWinRate = () => {
                let winRate = (((queue.wins) / (queue.wins + queue.losses)) * 100).toFixed(1);
                RANKED_SOLO_WIN_RATE_COLOR = winRate < 50 ? '#fe346e' : '#43d8c9';
                if (winRate.charAt(winRate.length - 1) === '0') winRate = winRate.slice(0, winRate.length - 2);
                return winRate;
            };
            rankedSoloLeaguePointsWinRate.innerHTML = `
            ${queue.leaguePoints} LP <span class="small-circle" style="margin: 0 3px"></span> 
            <span style="color: #a289b6"> ${queue.wins} W – ${queue.losses} L</span> <span class="small-circle" style="margin: 0 3px"></span> 
            <span style="color: ${RANKED_SOLO_WIN_RATE_COLOR}">${getRankedSoloWinRate()}%</span>
            `;
            getRankedEmblem(queue.tier, rankedSoloEmblem);
        }
        if (queue.queueType === 'RANKED_FLEX_SR') {
            const rawRankedFlex = queue.tier;
            const rankedFlexFirstCharacter = rawRankedFlex.charAt(0);
            const rankedFlexFromSecondCharacter = rawRankedFlex.slice(1).toLowerCase();
            const rankedFlexFixed = rankedFlexFirstCharacter + rankedFlexFromSecondCharacter;
            let rankedFlexDivision = queue.rank;
            if (rankedFlexFixed === 'Master' || rankedFlexFixed === 'Grandmaster' || rankedFlexFixed === 'Challenger') rankedFlexDivision = '';
            rankedFlexElo.innerHTML = `
            <strong style="font-size: 0.9em">${rankedFlexFixed} ${rankedFlexDivision}</strong> 
            <span class="small-circle" style="border-color: #d4d4d4; margin: 0 2px"></span> 
            <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.85em">Ranked Flex</span>
            `;
            let RANKED_FLEX_WIN_RATE_COLOR;
            const getRankedFlexWinRate = () => {
                let winRate = (((queue.wins) / (queue.wins + queue.losses)) * 100).toFixed(1);
                RANKED_FLEX_WIN_RATE_COLOR = winRate < 50 ? '#fe346e' : '#43d8c9';
                if (winRate.charAt(winRate.length - 1) === '0') winRate = winRate.slice(0, winRate.length - 2);
                return winRate;
            };
            rankedFlexLeaguePointsWinRate.innerHTML = `
            ${queue.leaguePoints} LP <span class="small-circle" style="margin: 0 3px"></span> 
            <span style="color: #a289b6"> ${queue.wins} W – ${queue.losses} L</span> <span class="small-circle" style="margin: 0 3px"></span> 
            <span style="color: ${RANKED_FLEX_WIN_RATE_COLOR}">${getRankedFlexWinRate()}%</span>
            `;
            getRankedEmblem(queue.tier, rankedFlexEmblem);
        }
    });
}

function resetRanked() {
    rankedSoloEmblem.innerHTML = '<img src="images/ranked-emblems/Emblem_Unranked.png" alt="Unranked">';
    rankedSoloElo.innerHTML = '<span style="color: #a289b6; font-size: 0.85em">Ranked Solo</span>';
    rankedSoloLeaguePointsWinRate.innerHTML = '<span style="color: #d1d1d1;">Unranked</span>';
    rankedFlexEmblem.innerHTML = '<img src="images/ranked-emblems/Emblem_Unranked.png" alt="Unranked">';
    rankedFlexElo.innerHTML = '<span style="color: #a289b6; font-size: 0.85em">Ranked Flex</span>';
    rankedFlexLeaguePointsWinRate.innerHTML = '<span style="color: #d1d1d1;">Unranked</span>';
}

function getRankedEmblem(id, where) {
    const emblems = {
        'IRON': '<img src="images/ranked-emblems/Emblem_Iron.png" alt="Iron">',
        'BRONZE': '<img src="images/ranked-emblems/Emblem_Bronze.png" alt="Bronze">',
        'SILVER': '<img src="images/ranked-emblems/Emblem_Silver.png" alt="Silver">',
        'GOLD': '<img src="images/ranked-emblems/Emblem_Gold.png" alt="Gold">',
        'PLATINUM': '<img src="images/ranked-emblems/Emblem_Platinum.png" alt="Platinum">',
        'DIAMOND': '<img src="images/ranked-emblems/Emblem_Diamond.png" alt="Diamond">',
        'MASTER': '<img src="images/ranked-emblems/Emblem_Master.png" alt="Master">',
        'GRANDMASTER': '<img src="images/ranked-emblems/Emblem_Grandmaster.png" alt="Grandmaster">',
        'CHALLENGER': '<img src="images/ranked-emblems/Emblem_Challenger.png" alt="Challenger">',
        default: '[Emblem not found]'
    };
    return where.innerHTML = emblems[id] || emblems.default;
}

// Fetching champion mastery data from the summoner that the user has inserted.
async function fetchChampionMastery() {
    try {
        resetButtonsBackgroundColor();
        resetSummonerInfo();
        resetChampionMastery();
        buttonChampionMastery.style.backgroundColor = 'rgba(93, 84, 164, 0.5)';
        loadingSummonerInfo.style.display = 'block';
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                summonerId: SUMMONER_ID
            })
        };
        const championMasteryResponse = await fetch('/champion-mastery', options);
        const championMasteryData = await championMasteryResponse.json();
        if (championMasteryData[0] === 'Error') {
            setTimeout(() => {
                console.log('aa');
                loadingSummonerInfo.style.display = 'none';
                notifyError.style.display = 'block';
                errorDescription.innerHTML = `We were unable to fetch and display the information that you've requested.`;
            }, 300);
            return;
        }
        if (championMasteryData.length === 0) {
            setTimeout(() => {
                loadingSummonerInfo.style.display = 'none';
                championMastery.style.display = 'block';
                moreMasteries.style.display = 'grid';
                moreMasteries.classList.add('no-more-masteries-display');
                noMoreMasteries.style.display = 'block';
                noMoreMasteries.innerHTML = `<span style="color: #9791c5; font-weight: 700">${SUMMONER_NAME}</span> doesn't have champion masteries.`;
            }, 300);
            return;
        }
        CHAMPION_MASTERY = championMasteryData;
        await assembleChampionMastery(MASTERIES_START_INDEX, MASTERIES_END_INDEX);
        displayChampionMastery();
    } catch (err) {
        console.log('Error in function %cfetchChampionMastery', errorInFunction);
        console.error(err);
    }
}

// Getting the champion mastery data from an amount of champions.
// Creating a container for each champion selected.
// The data for each champion will be displayed inside the container created.
// Each container created will be stored in an array.
async function assembleChampionMastery(startIndex, endIndex) {
    const summonerChampions = CHAMPION_MASTERY.slice(startIndex, endIndex);
    summonerChampions.forEach(champion => {
        for (let i in CHAMPIONS_DATA) {
            if (CHAMPIONS_DATA[i].key == champion.championId) {
                const div = document.createElement('div');
                const divChampionMasteryHeader = document.createElement('div');
                const divChampionMasteryMain = document.createElement('div');
                const divChampionMasteryFooter = document.createElement('div');
                const championMasteryRank = document.createElement('p');
                const divChampionImage = document.createElement('div');
                const championImage = document.createElement('img');
                const divChampionNameAndTitle = document.createElement('div');
                const championName = document.createElement('p');
                const championTitle = document.createElement('p');
                const divChampionMasteryAndPoints = document.createElement('div'); 
                const championPoints = document.createElement('p');
                const championLastPlayed = document.createElement('p');
                div.className = 'champion';
                divChampionMasteryHeader.className = 'champion-mastery-header';
                divChampionMasteryMain.className = 'champion-mastery-main';
                divChampionMasteryFooter.className = 'champion-mastery-footer';
                championMasteryRank.className = 'champion-mastery-rank';
                divChampionImage.className = 'champion-image';
                divChampionNameAndTitle.className = 'champion-name-title';
                championName.className = 'champion-name';
                championTitle.className = 'champion-title';
                divChampionMasteryAndPoints.className = 'champion-mastery-points';
                championPoints.className = 'champion-points';
                championLastPlayed.className = 'champion-last-played';

                championMasteryRank.innerHTML = `Rank #${CHAMPION_MASTERY_RANK}`;
                CHAMPION_MASTERY_RANK++;
                championImage.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/champion/${CHAMPIONS_DATA[i].id}.png`;
                championImage.alt = CHAMPIONS_DATA[i].name;
                championName.innerHTML = CHAMPIONS_DATA[i].name;
                const rawChampionTitle = CHAMPIONS_DATA[i].title;
                const championTitleFirstCharacter = rawChampionTitle.charAt(0).toUpperCase();
                const championTitleFromSecondCharacter = rawChampionTitle.slice(1);
                const championTitleFixed = championTitleFirstCharacter + championTitleFromSecondCharacter;
                championTitle.innerHTML = championTitleFixed;
                getMasteryFlair(champion.championLevel, divChampionMasteryAndPoints);
                championPoints.innerHTML = (champion.championPoints).toLocaleString('en-GB');
                const lastPlayed = new Date(champion.lastPlayTime);
                championLastPlayed.innerHTML = `Last played: ${lastPlayed.toLocaleDateString('en-GB')}`;

                divChampionImage.appendChild(championImage);
                divChampionNameAndTitle.appendChild(championName);
                divChampionNameAndTitle.appendChild(championTitle);
                divChampionMasteryAndPoints.appendChild(championPoints);
                divChampionMasteryHeader.appendChild(championMasteryRank);
                divChampionMasteryMain.appendChild(divChampionImage);
                divChampionMasteryMain.appendChild(divChampionNameAndTitle);
                divChampionMasteryMain.appendChild(divChampionMasteryAndPoints);
                divChampionMasteryFooter.appendChild(championLastPlayed);
                div.appendChild(divChampionMasteryHeader);
                div.appendChild(divChampionMasteryMain);
                div.appendChild(divChampionMasteryFooter);
                arrayChampionMastery.push(div);
                MASTERIES_COUNT++;
            }
        }
    });
}

function getMasteryFlair(id, where) {
    const masteries = {
        '1': '<img src="images/mastery-flairs/mastery-level-1.png" alt="Mastery level 1">',
        '2': '<img src="images/mastery-flairs/mastery-level-2.png" alt="Mastery level 2">',
        '3': '<img src="images/mastery-flairs/mastery-level-3.png" alt="Mastery level 3">',
        '4': '<img src="images/mastery-flairs/mastery-level-4.png" alt="Mastery level 4">',
        '5': '<img src="images/mastery-flairs/mastery-level-5.png" alt="Mastery level 5">',
        '6': '<img src="images/mastery-flairs/mastery-level-6.png" alt="Mastery level 6">',
        '7': '<img src="images/mastery-flairs/mastery-level-7.png" alt="Mastery level 7">',
        default: '[Mastery not found]'
    };
    return where.innerHTML = masteries[id] || emblems.default;
}

// After the containers have been created and stored in the array, display all of them in the document.
function displayChampionMastery() {
    loadingSummonerInfo.style.display = 'none';
    championMastery.style.display = 'block';
    arrayChampionMastery.forEach(mastery => championMastery.insertAdjacentElement('beforeend', mastery));
    arrayChampionMastery = [];
    manageMoreMasteries();
}

// Displaying more champion masteries.
buttonLoadMoreMasteries.addEventListener('click', () => {
    buttonLoadMoreMasteries.style.display = 'none';
    moreMasteries.classList.add('more-masteries-loading');
    loadingMoreMasteries.style.display = 'block';
    assembleChampionMastery(MASTERIES_START_INDEX, MASTERIES_END_INDEX);
    setTimeout(() => displayChampionMastery(), 700);
});

// Displaying the button 'Show more' while there are still champions in the CHAMPION_MASTERY variable.
function manageMoreMasteries() {
    championMastery.insertAdjacentElement('beforeend', moreMasteries);
    moreMasteries.style.display = 'grid';
    moreMasteries.classList.remove('more-masteries-loading');
    loadingMoreMasteries.style.display = 'none';
    if (MASTERIES_COUNT >= CHAMPION_MASTERY.length) {
        moreMasteries.classList.add('no-more-masteries-display');
        noMoreMasteries.style.display = 'block';
        noMoreMasteries.innerHTML = `<span style="color: #9791c5; font-weight: 700">${SUMMONER_NAME}</span> doesn't have more masteries.`;
    } else {
        MASTERIES_START_INDEX += 5;
        MASTERIES_END_INDEX += 5;
        buttonLoadMoreMasteries.style.display = 'block';
    }
}

function resetChampionMastery() {
    const champions = document.querySelectorAll('.champion');
    const arrayChampions = [...champions];
    arrayChampions.forEach(champion => champion.remove());
    CHAMPION_MASTERY = [];
    MASTERIES_START_INDEX = 0;
    MASTERIES_END_INDEX = 5;
    CHAMPION_MASTERY_RANK = 1;
    MASTERIES_COUNT = 0;
    moreMasteries.style.display = 'none';
    buttonLoadMoreMasteries.style.display = 'none';
    loadingMoreMasteries.style.display = 'none';
    noMoreMasteries.style.display = 'none';
    moreMasteries.classList.remove('no-more-masteries-display');
    moreMasteries.classList.remove('more-masteries-loading');
}

// Fetching the match history data from the summoner that the user has inserted.
async function fetchMatchHistory() {
    try {
        resetButtonsBackgroundColor();
        resetSummonerInfo();
        resetMatchHistory();
        buttonMatchHistory.style.backgroundColor = 'rgba(93, 84, 164, 0.5)';
        loadingSummonerInfo.style.display = 'block';
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountId: ACCOUNT_ID
            })
        };
        const matchHistoryResponse = await fetch('/match-history', options);
        const matchHistoryData = await matchHistoryResponse.json();
        if (matchHistoryData[0] === 'Error') {
            setTimeout(() => {
                loadingSummonerInfo.style.display = 'none';
                notifyError.style.display = 'block';
                errorDescription.innerHTML = `
                We were unable to fetch and display the information that you've requested. <br> <br>
                <span style="font-weight: 700">This might be because:</span> <br>
                <span class="small-circle" style="margin-right: 2px"></span> Summoner hasn't played any matches <br>
                <span class="small-circle" style="margin-right: 2px"></span> Summoner is in a long period of inactivity
                `;
            }, 300);
            return;
        }
        MATCH_HISTORY = matchHistoryData.matches;
        await fetchMatches(MATCHES_START_INDEX, MATCHES_END_INDEX);
    } catch (err) {
        console.log('Error in function %cfetchMatchHistory', errorInFunction);
        console.error(err);
    }
}

// Fetching an amount of matches from the match history.
async function fetchMatches(startIndex, endIndex) {
    try {
        let MATCHES_ID = [];
        let matches = MATCH_HISTORY.slice(startIndex, endIndex);
        matches.map(match => MATCHES_ID.push(match.gameId));
        for (let i = 0; i < MATCHES_ID.length; i++) {
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    matchId: MATCHES_ID[i]
                })
            };
            const matchResponse = await fetch('/match', options);
            const matchData = await matchResponse.json();
            await getMatchesData(matchData);
        }
        displayMatches();
    } catch (err) {
        console.log('Error in function %cfetchMatches', errorInFunction);
        console.error(err);
    }
}

// Fetching the match's data and the summoner's data in the match.
async function getMatchesData(data) {
    const players = data.participantIdentities;
    for (let i in players) {
        if (players[i].player.currentAccountId == ACCOUNT_ID) {
            const matchData = data;
            const playerData = data.participants[i];
            assembleMatches(matchData, playerData);
        }
    }
}

// Creating a container for each match that has been fetched.
// The data for each match will be displayed inside the container created.
// Each container created will be stored in an array.
function assembleMatches(matchData, playerData) {
    console.log(matchData);
    console.log(playerData);
    const div = document.createElement('div');
    const divHeader = document.createElement('div');
    const divInfo = document.createElement('div');
    const divFooter = document.createElement('div');
    const divMoreInfo = document.createElement('div');
    const matchDateAndDuration = document.createElement('div');
    const summonerChampion = document.createElement('div');
    const summonerChampionImage = document.createElement('img');
    const summonerSpells = document.createElement('div');
    const summonerRunes = document.createElement('div');
    const summonerScoreAndKDA = document.createElement('div');
    const summonerLevelCSAndKP = document.createElement('div');
    const buttonExpandInfo = document.createElement('button');
    const summonerItems = document.createElement('div');
    const summonersChampions = document.createElement('div');
    let MATCH_TIMESTAMP;
    div.className = 'match';
    div.id = matchData.gameId;
    divHeader.className = 'match-header';
    divInfo.className = 'match-info';
    divFooter.className = 'match-footer';
    divMoreInfo.className = 'match-more-info';
    divMoreInfo.id = matchData.gameId;
    matchDateAndDuration.className = 'match-date-duration';
    summonerChampion.className = 'match-champion';
    summonerSpells.className = 'match-spells';
    summonerRunes.className = 'match-runes';
    summonerScoreAndKDA.className = 'match-score-kda';
    summonerLevelCSAndKP.className = 'match-level-cs-kp';
    buttonExpandInfo.className = 'button-expand-info';
    summonerItems.className = 'match-items';
    summonersChampions.className = 'match-champions';

    for (let i in CHAMPIONS_DATA) {
        if (CHAMPIONS_DATA[i].key == playerData.championId) {

            // Getting match outcome (victory or defeat)
            const getMatchOutcome = (teams, playerResult, matchDurationInSeconds) => {
                teams.map(team => {
                    if (team.win === 'Win') {
                        if (matchDurationInSeconds < 270 && team.inhibitorKills == '0') {
                            div.style.backgroundImage = 'linear-gradient(to right, #8a8a8a, #8a8a8a, #a1a1a1)';
                            return;
                        }
                        const winnerTeam = team.teamId;
                        if (winnerTeam == playerResult) {
                            div.style.backgroundImage = 'linear-gradient(to right, rgba(26, 160, 97, 0.4), rgba(26, 160, 97, 0.3), rgba(26, 160, 97, 0.2))';
                            summonerChampionImage.style.border = '3px solid rgba(26, 160, 97, 0.8)';
                        } else {
                            div.style.backgroundImage = 'linear-gradient(to right, rgba(160, 26, 55, 0.4), rgba(160, 26, 55, 0.3), rgba(160, 26, 55, 0.2))';
                            summonerChampionImage.style.border = '3px solid rgba(160, 26, 55, 0.8)';
                        }
                    }
                });
            };

            getMatchOutcome(matchData.teams, playerData.teamId, matchData.gameDuration);

            // Getting map and game mode.
            QUEUES_DATA.map(queue => {
                if (queue.queueId == matchData.queueId) {
                    let mapAndGameMode = document.createElement('p');
                    mapAndGameMode.className = 'match-map-gamemode';
                    const rawGameMode = queue.description;
                    const wordsToBeRemoved = ['5v5', 'games'];
                    let gameModeFixed = rawGameMode;
                    wordsToBeRemoved.map(word => gameModeFixed = gameModeFixed.replace(word, ''));
                    mapAndGameMode.innerHTML = `${queue.map} <span class="small-circle" style="margin: 0 3px"></span> <strong>${gameModeFixed}</strong>`;
                    divHeader.appendChild(mapAndGameMode);           
                }
            });

            // Getting match date.
            const getMatchDate = (matchCreation, matchDuration) => {
                const matchDate = document.createElement('p');
                matchDate.className = 'match-date';
                const intervals = [
                    { label: 'year', seconds: 31536000 },
                    { label: 'month', seconds: 2592000 },
                    { label: 'day', seconds: 86400 },
                    { label: 'hour', seconds: 3600 },
                    { label: 'minute', seconds: 60 },
                    { label: 'second', seconds: 0 }
                ];
                let matchTimestamp = matchCreation + (matchDuration * 1000);
                let currentTimestamp = Date.now();
                let differenceInSeconds = Math.floor((currentTimestamp - matchTimestamp) / 1000);
                const interval = intervals.find(interval => interval.seconds < differenceInSeconds);
                const number = Math.floor(differenceInSeconds / interval.seconds);
                let labelGrammar = number !== 1 ? 's' : '';
                matchDate.innerHTML = `${number} ${interval.label}${labelGrammar} ago <span class="small-circle" style="margin: 0 4.5px 0 3.5px"></span>`;
                matchDateAndDuration.appendChild(matchDate);
            };

            getMatchDate(matchData.gameCreation, matchData.gameDuration);

            // Getting match duration
            let MATCH_MINUTES, MATCH_SECONDS;
            const getMatchDuration = matchDurationInSeconds => {
                const matchDuration = document.createElement('p');
                matchDuration.className = 'match-duration';
                let minutes = Math.floor(matchDurationInSeconds / 60);
                let seconds = matchDurationInSeconds - minutes * 60;
                let minutesFixed = minutes < 10 ? `0${minutes}` : minutes;
                let secondsFixed = seconds < 10 ? `0${seconds}` : seconds;
                MATCH_MINUTES = minutesFixed;
                MATCH_SECONDS = secondsFixed;
                matchDuration.innerHTML = `${MATCH_MINUTES}:${MATCH_SECONDS}`;
                matchDateAndDuration.appendChild(matchDuration);
            };

            getMatchDuration(matchData.gameDuration);

            // Getting summoner's champion
            summonerChampionImage.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/champion/${CHAMPIONS_DATA[i].id}.png`;
            summonerChampionImage.alt = CHAMPIONS_DATA[i].name;
            summonerChampion.appendChild(summonerChampionImage);

            // Getting summoner's spells
            const getSummonerSpells = () => {
                const spellsPlayed = [
                    { spell1: playerData.spell1Id },
                    { spell2: playerData.spell2Id }
                ];
                spellsPlayed.map(spell => {
                    const spellId = Number(Object.values(spell));
                    for (let i in SPELLS_DATA) {
                        if (SPELLS_DATA[i].key == spellId) {
                            const spellImage = document.createElement('img');
                            spellImage.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/spell/${SPELLS_DATA[i].id}.png`;
                            spellImage.alt = SPELLS_DATA[i].name;
                            summonerSpells.appendChild(spellImage);
                        }
                    }
                });
            };
            
            getSummonerSpells();

            // Getting summoner's runes (primary keystone and secondary rune)
            const getSummonerRunes = (primaryKeystone, secondaryRune) => {
                RUNES_DATA.map(tree => {
                    tree.slots.map(rune => {
                        rune.runes.map(keystone => {
                            if (keystone.id == primaryKeystone) {
                                const primaryKeystone = document.createElement('img');
                                primaryKeystone.src = `https://ddragon.leagueoflegends.com/cdn/img/${keystone.icon}`;
                                primaryKeystone.alt = keystone.name;
                                summonerRunes.appendChild(primaryKeystone);
                            }
                        });
                    });
                });
                RUNES_DATA.map(tree => {
                    if (tree.id == secondaryRune) {
                        const secondaryRune = document.createElement('img');
                        secondaryRune.src = `https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`;
                        secondaryRune.alt = tree.name;
                        summonerRunes.appendChild(secondaryRune);
                    }
                });
            };
            
            getSummonerRunes(playerData.stats.perk0, playerData.stats.perkSubStyle);

            // Getting summoner's score and KDA
            const getSummonerScoreAndKDA = (kills, deaths, assists) => {
                const summonerScore = document.createElement('p');
                const summonerKDA = document.createElement('p');
                summonerScore.innerHTML = `${kills} <span class="match-info-span">/</span> ${deaths} <span class="match-info-span">/</span> ${assists}`;
                let kda = ((kills + assists) / deaths).toFixed(1);
                if (isNaN(kda)) kda = 0;
                if (!isFinite(kda)) kda = kills + assists;
                summonerKDA.innerHTML = `${kda} <span class="match-info-span">KDA</span>`;
                summonerScoreAndKDA.appendChild(summonerScore);
                summonerScoreAndKDA.appendChild(summonerKDA);
            };

            getSummonerScoreAndKDA(playerData.stats.kills, playerData.stats.deaths, playerData.stats.assists);

            // Getting summoner's level
            const getSummonerLevel = level => {
                const summonerLevel = document.createElement('p');
                summonerLevel.innerHTML = `Level <strong>${level}<strong>`;
                summonerLevelCSAndKP.appendChild(summonerLevel);
            };

            getSummonerLevel(playerData.stats.champLevel);

            // Getting summoner's creep score and creep score per minute
            const getSummonerCreepScore = (totalCreepScore) => {
                const summonerCreepScore = document.createElement('p');
                let matchDuration = parseFloat(`${MATCH_MINUTES}.${MATCH_SECONDS}`);
                let rawCreepScorePerMinute = `${totalCreepScore / matchDuration}`;
                let creepScorePerMinuteFixed;
                if (rawCreepScorePerMinute !== '0') {
                    creepScorePerMinuteFixed = rawCreepScorePerMinute.slice(0, rawCreepScorePerMinute.indexOf('.') + 2);
                    if (creepScorePerMinuteFixed.charAt(creepScorePerMinuteFixed.length - 1) === '0') {
                        creepScorePerMinuteFixed = creepScorePerMinuteFixed.slice(0, creepScorePerMinuteFixed.length - 2);
                    }
                } else {
                    creepScorePerMinuteFixed = 0;
                }
                summonerCreepScore.innerHTML = `${totalCreepScore} (${creepScorePerMinuteFixed}) <span class="match-info-span">CS</span>`;
                summonerLevelCSAndKP.appendChild(summonerCreepScore);
            };

            getSummonerCreepScore(playerData.stats.totalMinionsKilled);
            // getSummonerCreepScore(0);

            // Getting summoner's kill participation
            const getSummonerKillParticipation = (allSummonersInTheMatch, summonerOutcome) => {
                const summonerKillParticipation = document.createElement('p');
                const sumSummonerKillsAndAssists = playerData.stats.kills + playerData.stats.assists;
                let summonerTeamTotalKills = 0;
                allSummonersInTheMatch.map(summoner => {
                    const allSummonersData = Object.entries(summoner);
                    allSummonersData.forEach(index => {
                        const dataDescription = index[0];
                        const dataValue = index[1];
                        if (dataDescription === 'stats') {
                            if (dataValue.win === summonerOutcome) {
                                summonerTeamTotalKills += dataValue.kills;
                            }
                        }
                    });
                });
                let killParticipation = Math.round((sumSummonerKillsAndAssists / summonerTeamTotalKills) * 100);
                if (isNaN(killParticipation)) killParticipation = 0;
                summonerKillParticipation.innerHTML = `<strong>${killParticipation}%</strong> <span class="match-info-span">KP</span>`;
                summonerLevelCSAndKP.appendChild(summonerKillParticipation);
            };

            getSummonerKillParticipation(matchData.participants, playerData.stats.win);

            // Adding the 'show more' button to the match footer
            buttonExpandInfo.innerHTML = `<img src="images/expand-button.png" id="${matchData.gameId}" class="button-expand-info-image">`;
            divFooter.appendChild(buttonExpandInfo);

            // Getting match's patch
            const getMatchPatch = patchDescription => {
                const matchPatch = document.createElement('p');
                matchPatch.className = 'match-patch';
                const season = patchDescription.split('.').slice(0, 1);
                const patch = patchDescription.split('.').slice(1, 2);
                matchPatch.innerHTML = `<span class="match-info-span">Played on patch</span> <strong>${season}.${patch}</strong>`;
                divFooter.appendChild(matchPatch);
            };

            getMatchPatch(matchData.gameVersion);

            // Getting summoner's items
            const getSummonerItems = () => {
                const items = [
                    { item0: playerData.stats.item0 },
                    { item1: playerData.stats.item1 },
                    { item2: playerData.stats.item2 },
                    { item3: playerData.stats.item3 },
                    { item4: playerData.stats.item4 },
                    { item5: playerData.stats.item5 },
                    { item6: playerData.stats.item6 }
                ];
                items.map(item => {
                    const divImage = document.createElement('div');
                    const itemImage = document.createElement('img');
                    divImage.className = 'item-build';
                    const itemId = Object.values(item);
                    if (itemId != '0') {
                        itemImage.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/item/${itemId}.png`;
                        divImage.appendChild(itemImage);
                    }
                    summonerItems.appendChild(divImage);
                });
            };
            
            getSummonerItems();

            // Getting summoners' champions
            const getSummonersChampions = summoners => {
                const blueTeam = document.createElement('div');
                const redTeam = document.createElement('div');
                blueTeam.className = 'match-blue-team';
                redTeam.className = 'match-red-team';
                summoners.map(summoner => {
                    for (let i in CHAMPIONS_DATA) {
                        const championImage = document.createElement('img');
                        const championName = CHAMPIONS_DATA[i].id;
                        if (CHAMPIONS_DATA[i].key == summoner.championId) {
                            if (summoner.teamId === 100) {
                                championImage.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/champion/${championName}.png`;
                                championImage.alt = championName;
                                blueTeam.appendChild(championImage);
                            } else {
                                championImage.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/champion/${championName}.png`;
                                championImage.alt = championName;
                                redTeam.appendChild(championImage);
                            }
                        }
                    }
                });
                summonersChampions.appendChild(blueTeam);
                summonersChampions.appendChild(redTeam);
            };

            getSummonersChampions(matchData.participants);

            // Getting match timestamp
            const getMatchTimestamp = (matchCreation, matchDuration) => MATCH_TIMESTAMP = matchCreation + (matchDuration * 1000);

            getMatchTimestamp(matchData.gameCreation, matchData.gameDuration)

        }
    }

    MATCHES_COUNT++;

    divHeader.appendChild(matchDateAndDuration);
    divInfo.appendChild(summonerChampion);
    divInfo.appendChild(summonerSpells);
    divInfo.appendChild(summonerRunes);
    divInfo.appendChild(summonerScoreAndKDA);
    divInfo.appendChild(summonerLevelCSAndKP);
    divMoreInfo.appendChild(summonerItems);
    divMoreInfo.appendChild(summonersChampions);
    div.appendChild(divHeader);
    div.appendChild(divInfo);
    div.appendChild(divMoreInfo);
    div.appendChild(divFooter);
    arrayMatches.push({content: div, timestamp: MATCH_TIMESTAMP});
}

// Whenever the user clicks in the button \/ in a match container, it'll show the remaining data of that specific match.
window.addEventListener('click', event => {
    const element = event.target;
    if (element.classList == 'button-expand-info') {
        const matchContainer = element.parentElement.parentElement;
        const matchContainerId = element.parentElement.parentElement.id;
        const divsInsideMatchContainer = matchContainer.getElementsByTagName('div');
        const divMoreInfo = divsInsideMatchContainer[8];
        const divMoreInfoId = divMoreInfo.id;
        const imagesInsideExpandButton = document.querySelectorAll('.button-expand-info-image');
        const arrayImagesInsideExpandButton = [...imagesInsideExpandButton];
        if (matchContainerId == divMoreInfoId) {
            if (divMoreInfo.style.maxHeight) {
                divMoreInfo.style.maxHeight = null;
                divMoreInfo.classList.remove('match-more-info-expand');
                arrayImagesInsideExpandButton.forEach(image => {
                    if (image.id == matchContainerId) {
                        image.classList.remove('button-expand-info-image-flip');
                    }
                });
            } else {
                divMoreInfo.style.maxHeight = `${divMoreInfo.scrollHeight}px`;
                divMoreInfo.classList.add('match-more-info-expand');
                arrayImagesInsideExpandButton.forEach(image => {
                    if (image.id == matchContainerId) {
                        image.classList.add('button-expand-info-image-flip');
                    }
                });
            }
        }
    }
});

// After the matches have been created and stored in the array, display all of them in the document in chronological order.
function displayMatches() {
    loadingSummonerInfo.style.display = 'none';
    matchHistory.style.display = 'block';
    const arrayMatchesInOrder = arrayMatches.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    arrayMatchesInOrder.forEach(match => matchHistory.insertAdjacentElement('beforeend', match.content));
    arrayMatches = [];
    manageMoreMatches();
}

// Fetching and displaying more matches.
buttonLoadMoreMatches.addEventListener('click', () => {
    buttonLoadMoreMatches.style.display = 'none';
    moreMatches.classList.add('more-matches-loading');
    loadingMoreMatches.style.display = 'block';
    fetchMatches(MATCHES_START_INDEX, MATCHES_END_INDEX);
});

// Displaying the button 'Show more' while there are still matches in the MATCH_HISTORY variable.
function manageMoreMatches() {
    matchHistory.insertAdjacentElement('beforeend', moreMatches);
    moreMatches.style.display = 'grid';
    moreMatches.classList.remove('more-matches-loading');
    loadingMoreMatches.style.display = 'none';
    if (MATCHES_COUNT >= MATCH_HISTORY.length) {
        moreMatches.classList.add('no-more-matches-display');
        noMoreMatches.style.display = 'block';
        noMoreMatches.innerHTML = `<span style="color: #9791c5; font-weight: 700">${SUMMONER_NAME}</span> hasn't played more matches.`;
    } else {
        MATCHES_START_INDEX += 5;
        MATCHES_END_INDEX += 5;
        buttonLoadMoreMatches.style.display = 'block';
    }
}

function resetMatchHistory() {
    const matches = document.querySelectorAll('.match');
    const arrayMatches = [...matches];
    arrayMatches.forEach(match => match.remove());
    MATCH_HISTORY = [];
    MATCHES_START_INDEX = 0;
    MATCHES_END_INDEX = 5;
    MATCHES_COUNT = 0;
    moreMatches.style.display = 'none';
    buttonLoadMoreMatches.style.display = 'none';
    loadingMoreMatches.style.display = 'none';
    noMoreMatches.style.display = 'none';
    moreMatches.classList.remove('more-matches-loading');
    moreMatches.classList.remove('no-more-matches-display');
}

// Hide and display the 'scroll to the top button' based on how much the user has scrolled down.
window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (scroll > 500) {
        buttonScrollToTop.style.display = 'flex';
    } else {
        buttonScrollToTop.style.display = 'none';
    }
});

buttonScrollToTop.addEventListener('click', () => {
    setTimeout(() => {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, 200);
});
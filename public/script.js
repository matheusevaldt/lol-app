const inputSummoner = document.querySelector('.input-summoner');
const buttonSubmitSummoner = document.querySelector('.button-submit-summoner');
const regionSummoner = document.querySelector('.region-summoner');

let ACCOUNT_ID;
let SUMMONER_ID;
let SUMMONER_NAME;
let CURRENT_VERSION;
let CHAMPIONS_DATA;
let SPELLS_DATA;
let RUNES_DATA;
let QUEUE_DATA;
let arrayMatches = [];

const ranked = document.querySelector('.ranked');
const rankedSolo = document.querySelector('.ranked-solo');
const rankedFlex = document.querySelector('.ranked-flex');
const rankedSoloEmblem = document.querySelector('.ranked-solo-emblem');
const rankedFlexEmblem = document.querySelector('.ranked-flex-emblem');
const rankedSoloElo = document.querySelector('.ranked-solo-elo');
const rankedFlexElo = document.querySelector('.ranked-flex-elo');
const rankedSoloLeaguePointsWinRate = document.querySelector('.ranked-solo-league-points-win-rate');
const rankedFlexLeaguePointsWinRate = document.querySelector('.ranked-flex-league-points-win-rate');
const buttonRanked = document.querySelector('.button-ranked');

const loadingSummonerInfo = document.querySelector('.loading-summoner-info');

const buttonChampionMastery = document.querySelector('.button-champion-mastery');
const buttonMatchHistory = document.querySelector('.button-match-history');

const matchHistory = document.querySelector('.match-history');
// const loadingMatches = document.querySelector('.loading-matches');

buttonSubmitSummoner.addEventListener('click', event => event.preventDefault());
buttonSubmitSummoner.addEventListener('click', fetchSummonerData);
buttonRanked.addEventListener('click', fetchRankedData);
buttonChampionMastery.addEventListener('click', fetchChampionMastery);
buttonMatchHistory.addEventListener('click', fetchMatchHistory);

const championMastery = document.querySelector('.champion-mastery');

const formSummoner = document.querySelector('.form-summoner');
const summary = document.querySelector('.summary');
const buttonReturnToSearchSummoner = document.querySelector('.button-return-to-search-summoner');
const summonerInfo = document.querySelector('.summoner-info');

buttonReturnToSearchSummoner.addEventListener('click', returnToSearchSummoner);
const loadingSummoner = document.querySelector('.loading-summoner');

function returnToSearchSummoner() {
    inputSummoner.value = '';
    summary.style.display = 'none';
    summonerInfo.style.display = 'none';
    resetButtonsBackgroundColor();
    ranked.style.display = 'none';
    championMastery.style.display = 'none';
    matchHistory.style.display = 'none';
    formSummoner.style.display = 'grid';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchCurrentVersion);
} else {
    fetchCurrentVersion();
}

async function fetchCurrentVersion() {
    try {
        const championsURL = 'https://ddragon.leagueoflegends.com/api/versions.json';
        const championsResponse = await fetch(championsURL);
        const championsData = await championsResponse.json();
        CURRENT_VERSION = championsData[0];
        console.log(`Version: ${CURRENT_VERSION}`);
    } catch (err) {
        console.log('Error in function: fetchCurrentVersion');
        console.error(err);
    }
}

async function fetchSummonerData() {
    try {
        formSummoner.style.display = 'none';
        setTimeout(() => loadingSummoner.style.display = 'block', 100);
        const summoner = encodeURI(inputSummoner.value);
        const region = regionSummoner.options[regionSummoner.selectedIndex].value;
        const server = regionSummoner.options[regionSummoner.selectedIndex].text;
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
        const response = await fetch('/', options);
        const data = await response.json();
        console.log('SUMMONER DATA:');
        console.log(data);
        if (data === '404') return summary.innerHTML = 'PLAYER NOT FOUND';
        ACCOUNT_ID = data.accountId;
        SUMMONER_ID = data.id;
        SUMMONER_NAME = data.name;
        await displaySummonerSummary(data, server);
        const championsData = await fetchChampionsData();
        const spellsData = await fetchSpellsData();
        const runesData = await fetchRunesData();
        const queueData = await fetchQueueData();
        const dataFetched = await Promise.all([championsData, spellsData, runesData, queueData]);
        return dataFetched;
    } catch (err) {
        console.log('There has been an error.');
        console.error(err);
    }
}

async function displaySummonerSummary(data, server) {
    loadingSummoner.style.display = 'none';
    summary.style.display = 'block';
    summonerInfo.style.display = 'block';
    const summonerName = document.querySelector('.summoner-name');
    const summonerLevel = document.querySelector('.summoner-level');
    const summonerIcon = document.querySelector('.summoner-icon');
    const summonerServer = document.querySelector('.summoner-server');
    summonerName.innerHTML = data.name;
    summonerLevel.innerHTML = data.summonerLevel;
    summonerIcon.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/profileicon/${data.profileIconId}.png`;
    summonerServer.innerHTML = `${server} #1`;
}

async function fetchChampionsData() {
    try {
        const championsURL = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/data/en_US/champion.json`;
        const championsResponse = await fetch(championsURL);
        const championsData = await championsResponse.json();
        CHAMPIONS_DATA = championsData.data;
        console.log('CHAMPIONS DATA:')
        console.log(CHAMPIONS_DATA);
    } catch (err) {
        console.log('Error in function: fetchChampionsData');
        console.error(err);
    }
}

async function fetchSpellsData() {
    try {
        const spellsURL = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/data/en_US/summoner.json`;
        const spellsResponse = await fetch(spellsURL);
        const spellsData = await spellsResponse.json();
        SPELLS_DATA = spellsData.data;
        console.log('SPELLS DATA:');
        console.log(SPELLS_DATA);
    } catch (err) {
        console.log('Error in function: fetchSpellsData');
        console.error(err);
    }
}

async function fetchRunesData() {
    try {
        const runesURL = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/data/en_US/runesReforged.json`;
        const runesResponse = await fetch(runesURL);
        const runesData = await runesResponse.json();
        RUNES_DATA = runesData;
        console.log('RUNES DATA:');
        console.log(RUNES_DATA);
    } catch (err) {
        console.log('Error in function: fetchRunesData');
        console.error(err);
    }
}

async function fetchQueueData() {
    try {
        const queueURL = 'https://static.developer.riotgames.com/docs/lol/queues.json';
        const queueResponse = await fetch(queueURL);
        const queueData = await queueResponse.json();
        console.log('QUEUE DATA');
        console.log(queueData);
        QUEUE_DATA = queueData;
    } catch (err) {
        console.log('Error in function: fetchQueueData');
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
}

async function fetchRankedData() {
    try {
        resetButtonsBackgroundColor();
        resetSummonerInfo();
        resetRanked();
        buttonRanked.style.backgroundColor = 'rgba(93, 84, 164, 0.5)';
        setTimeout(() => loadingSummonerInfo.style.display = 'block', 100);
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
        console.log('SUMMONER RANKED DATA:');
        console.log(data);
        await displayRanked(data);
    } catch (err) {
        console.log('Error in function: fetchSummonerRankedData');
        console.error(err);
    }
}

async function displayRanked(data) {
    loadingSummonerInfo.style.display = 'none';
    ranked.style.display = 'flex';
    data.map(queue => {
        if (queue.queueType === 'RANKED_SOLO_5x5') {
            const rawRankedSolo = queue.tier;
            const rankedSoloFirstCharacter = rawRankedSolo.charAt(0);
            const rankedSoloFromSecondCharacter = rawRankedSolo.slice(1).toLowerCase();
            const rankedSoloFixed = rankedSoloFirstCharacter + rankedSoloFromSecondCharacter;
            rankedSoloElo.innerHTML = `<strong style="font-size: 0.9em">${rankedSoloFixed} ${queue.rank}</strong> <span style="color: #d4d4d4; padding: 0 2px">&#128900;</span> <span style="color: #a289b6; font-size: 0.85em">Ranked Solo</span>`;
            let RANKED_SOLO_WIN_RATE_COLOR;
            const getRankedSoloWinRate = () => {
                let winRate = (((queue.wins) / (queue.wins + queue.losses)) * 100).toFixed(1);
                RANKED_SOLO_WIN_RATE_COLOR = winRate < 50 ? '#fe346e' : '#43d8c9';
                if (winRate.charAt(winRate.length - 1) === '0') {
                    winRate = winRate.slice(0, winRate.length - 2);
                }
                return winRate;
            };
            getRankedSoloWinRate();
            rankedSoloLeaguePointsWinRate.innerHTML = `${queue.leaguePoints} LP <span style="color: #d4d4d4; padding: 0 3px">&#128900;</span> <span style="color: #a289b6"> ${queue.wins} W – ${queue.losses} L</span> <span style="color: #d4d4d4; padding: 0 3px">&#128900;</span> <span style="color: ${RANKED_SOLO_WIN_RATE_COLOR}">${getRankedSoloWinRate()}%</span>`;
            getRankedEmblem(queue.tier, rankedSoloEmblem);
        }
        if (queue.queueType === 'RANKED_FLEX_SR') {
            const rawRankedFlex = queue.tier;
            const rankedFlexFirstCharacter = rawRankedFlex.charAt(0);
            const rankedFlexFromSecondCharacter = rawRankedFlex.slice(1).toLowerCase();
            const rankedFlexFixed = rankedFlexFirstCharacter + rankedFlexFromSecondCharacter;
            rankedFlexElo.innerHTML = `<strong style="font-size: 0.9em">${rankedFlexFixed} ${queue.rank}</strong> <span style="color: #d4d4d4; padding: 0 2px">&#128900;</span> <span style="color: #a289b6; font-size: 0.85em">Ranked Flex</span>`;
            let RANKED_FLEX_WIN_RATE_COLOR;
            const getRankedFlexWinRate = () => {
                let winRate = (((queue.wins) / (queue.wins + queue.losses)) * 100).toFixed(1);
                RANKED_FLEX_WIN_RATE_COLOR = winRate < 50 ? '#fe346e' : '#43d8c9';
                if (winRate.charAt(winRate.length - 1) === '0') {
                    winRate = winRate.slice(0, winRate.length - 2);
                }
                return winRate;
            };
            getRankedFlexWinRate();
            rankedFlexLeaguePointsWinRate.innerHTML = `${queue.leaguePoints} LP <span style="color: #d4d4d4; padding: 0 3px">&#128900;</span> <span style="color: #a289b6"> ${queue.wins} W – ${queue.losses} L</span> <span style="color: #d4d4d4; padding: 0 3px">&#128900;</span> <span style="color: ${RANKED_FLEX_WIN_RATE_COLOR}">${getRankedFlexWinRate()}%</span>`;
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


// CHAMPION MASTERY
let arrayChampionMastery = [];
let CHAMPION_MASTERY, CHAMPION_MASTERY_RANK, MASTERIES_START_INDEX, MASTERIES_END_INDEX;
const moreMasteries = document.querySelector('.more-masteries');
const loadingMoreMasteries = document.querySelector('.loading-more-masteries');
const buttonLoadMoreMasteries = document.querySelector('.button-load-more-masteries');
const noMoreMasteries = document.querySelector('.no-more-masteries');

async function fetchChampionMastery() {
    try {
        resetButtonsBackgroundColor();
        resetSummonerInfo();
        resetChampionMastery();
        buttonChampionMastery.style.backgroundColor = 'rgba(93, 84, 164, 0.5)';
        setTimeout(() => loadingSummonerInfo.style.display = 'block', 100);
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
        const response = await fetch('/champion-mastery', options);
        const data = await response.json();
        console.log('CHAMPION MASTERY:');
        console.log(data);
        CHAMPION_MASTERY = data;
        await displayChampionMastery(CHAMPION_MASTERY, MASTERIES_START_INDEX, MASTERIES_END_INDEX);
        adjustChampionMasteryAfterDisplay();
    } catch (err) {
        console.log('Error in function: fetchChampionMastery');
        console.error(err);
    }
}

async function displayChampionMastery(data, startIndex, endIndex) {
    const summonerChampions = data.slice(startIndex, endIndex);
    summonerChampions.forEach(champion => {
        const championId = champion.championId;
        for (let i in CHAMPIONS_DATA) {
            if (CHAMPIONS_DATA[i].key == championId) {
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

                console.log(div);
                arrayChampionMastery.push(div);

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

function resetChampionMastery() {
    const champions = document.querySelectorAll('.champion');
    const arrayChampions = [...champions];
    arrayChampions.forEach(champion => champion.remove());
    MASTERIES_START_INDEX = 0;
    MASTERIES_END_INDEX = 5;
    CHAMPION_MASTERY_RANK = 1;
    CHAMPION_MASTERY = [];
    buttonLoadMoreMasteries.style.display = 'block';
    loadingMoreMasteries.style.display = 'none';
    noMoreMasteries.style.display = 'none';
    moreMasteries.classList.remove('no-more-masteries-display');
}

buttonLoadMoreMasteries.addEventListener('click', async () => {
    buttonLoadMoreMasteries.style.display = 'none';
    moreMasteries.classList.add('more-masteries-loading');
    loadingMoreMasteries.style.display = 'block';
    await displayChampionMastery(CHAMPION_MASTERY, MASTERIES_START_INDEX, MASTERIES_END_INDEX);
    setTimeout(() => adjustChampionMasteryAfterDisplay(), 700);
});

function adjustChampionMasteryAfterDisplay() {
    loadingSummonerInfo.style.display = 'none';
    championMastery.style.display = 'block';
    arrayChampionMastery.forEach(mastery => championMastery.insertAdjacentElement('beforeend', mastery));
    arrayChampionMastery = [];
    championMastery.insertAdjacentElement('beforeend', moreMasteries);
    moreMasteries.style.display = 'grid';
    moreMasteries.classList.remove('more-masteries-loading');
    loadingMoreMasteries.style.display = 'none';
    if (CHAMPION_MASTERY_RANK > CHAMPION_MASTERY.length) {
        moreMasteries.classList.add('no-more-masteries-display');
        noMoreMasteries.innerHTML = `<span style="color: #ffffff; font-weight: 700">${SUMMONER_NAME}</span> <span style="color: #cecece">doesn't have more masteries.</span>`;
        noMoreMasteries.style.display = 'block';
    } else {
        MASTERIES_START_INDEX += 5;
        MASTERIES_END_INDEX += 5;
        buttonLoadMoreMasteries.style.display = 'block';
    }
}


// MATCH HISTORY
let MATCH_HISTORY = [];
let MATCHES_START_INDEX = 0;
let MATCHES_END_INDEX = 5;
const moreMatches = document.querySelector('.more-matches');
const loadingMoreMatches = document.querySelector('.loading-more-matches');
const buttonLoadMoreMatches = document.querySelector('.button-load-more-matches');
buttonLoadMoreMatches.addEventListener('click', () => {
    buttonLoadMoreMatches.style.display = 'none';
    moreMatches.classList.add('more-matches-loading');
    loadingMoreMatches.style.display = 'block';
    fetchMatches(MATCHES_START_INDEX, MATCHES_END_INDEX);
});

async function fetchMatchHistory() {
    try {
        resetButtonsBackgroundColor();
        resetSummonerInfo();
        resetMatchHistory();
        MATCH_HISTORY = [];
        MATCHES_START_INDEX = 0;
        MATCHES_END_INDEX = 5;
        buttonMatchHistory.style.backgroundColor = 'rgba(93, 84, 164, 0.5)';
        setTimeout(() => loadingSummonerInfo.style.display = 'block', 100);
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account_id: ACCOUNT_ID
            })
        }
        const response = await fetch('/match-history', options);
        const data = await response.json();
        MATCH_HISTORY = data.matches;
        console.log(MATCH_HISTORY);
        await fetchMatches(MATCHES_START_INDEX, MATCHES_END_INDEX);
    } catch (err) {
        console.log('Error in function: fetchMatchHistory');
        console.error(err);
    }
}

async function fetchMatches(startIndex, endIndex) {
    try {
        matchHistory.style.display = 'block';
        let MATCHES_ID = [];
        let MATCHES_ID_ORDER = [];
        let getMatches = MATCH_HISTORY.slice(startIndex, endIndex);
        getMatches.map(match => MATCHES_ID.push(match.gameId));
        console.log(MATCHES_ID);
        MATCHES_ID_ORDER = MATCHES_ID.sort();
        console.log(MATCHES_ID_ORDER);
        for (let i = 0; i < MATCHES_ID_ORDER.length; i++) {
            console.log(MATCHES_ID_ORDER[i]);
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    match_id: MATCHES_ID_ORDER[i]
                })
            };
            const response = await fetch('/match', options);
            const data = await response.json();
            console.log(data);
            await fetchMatchesInfo(data);
        }
        // After all matches have been fetched, display all of them in the match history
        loadingSummonerInfo.style.display = 'none';
        arrayMatches.reverse();
        arrayMatches.forEach(match => matchHistory.insertAdjacentElement('beforeend', match));
        arrayMatches = [];
        MATCHES_START_INDEX += 5;
        MATCHES_END_INDEX += 5;
        // Adjusting the 'Show more' button in the bottom of the match history
        matchHistory.insertAdjacentElement('beforeend', moreMatches);
        moreMatches.style.display = 'grid';
        moreMatches.classList.remove('more-matches-loading');
        loadingMoreMatches.style.display = 'none';
        buttonLoadMoreMatches.style.display = 'block';
    } catch (err) {
        console.log('Error in function: fetchMatches');
        console.error(err);
    }
}

async function fetchMatchesInfo(data) {
    const players = data.participantIdentities;
    for (let i in players) {
        if (players[i].player.currentAccountId == ACCOUNT_ID) {
            const matchData = data;
            const playerData = data.participants[i];
            displayMatchesInfo(matchData, playerData);
        }
    }
}

function displayMatchesInfo(matchData, playerData) {
    
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
                            console.log('REMAKE');
                            div.style.backgroundImage = 'linear-gradient(to right, #8a8a8a, #8a8a8a, #a1a1a1)';
                            return;
                        }
                        const winnerTeam = team.teamId;
                        if (winnerTeam == playerResult) {
                            console.log(`Winner team: ${winnerTeam} - Player team: ${playerResult}`);
                            div.style.backgroundImage = 'linear-gradient(to right, rgba(26, 160, 97, 0.4), rgba(26, 160, 97, 0.3), rgba(26, 160, 97, 0.2))';
                            summonerChampionImage.style.border = '3px solid rgba(26, 160, 97, 0.8)';
                        } else {
                            console.log(`Winner team: ${winnerTeam} - Player team: ${playerResult}`);
                            div.style.backgroundImage = 'linear-gradient(to right, rgba(160, 26, 55, 0.4), rgba(160, 26, 55, 0.3), rgba(160, 26, 55, 0.2))';
                            summonerChampionImage.style.border = '3px solid rgba(160, 26, 55, 0.8)';
                        }
                    }
                });
            };

            getMatchOutcome(matchData.teams, playerData.teamId, matchData.gameDuration);

            // Getting map and game mode.
            QUEUE_DATA.map(queue => {
                if (queue.queueId == matchData.queueId) {
                    let mapAndGameMode = document.createElement('p');
                    mapAndGameMode.className = 'match-map-gamemode';
                    const rawGameMode = queue.description;
                    const wordsToBeRemoved = ['5v5', 'games'];
                    let gameModeFixed = rawGameMode;
                    wordsToBeRemoved.map(word => gameModeFixed = gameModeFixed.replace(word, ''));
                    mapAndGameMode.innerHTML = `${queue.map} <span style="padding: 0 3px">&#128900;</span> <strong>${gameModeFixed}</strong>`;
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
                matchDate.innerHTML = `${number} ${interval.label}${labelGrammar} ago<span style="padding: 0 4px">&#128900;</span>`;
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
                console.log(killParticipation);
                if (isNaN(killParticipation)) killParticipation = 0;
                console.log(killParticipation);
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

        }
    }

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
    arrayMatches.push(div);

    // goldEarned.innerHTML = `Gold: ${(playerData.stats.goldEarned/1000).toFixed(1)}k`;
    
}

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

function resetMatchHistory() {
    const matches = document.querySelectorAll('.match');
    const arrayMatches = [...matches];
    arrayMatches.forEach(match => match.remove());
    moreMatches.style.display = 'none';
    moreMatches.classList.remove('more-matches-loading');
    loadingMoreMatches.style.display = 'none';
    buttonLoadMoreMatches.style.display = 'block';
}




// ROLE PLAYER WAS PLAYING
// if summoner's rift
// if not coop vs ai
// get role (top, jungler, mid, adc, support)
// blind pick - 430
// draft pick - 400
// ranked solo - 420
// ranked flex - 440
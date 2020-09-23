const inputSummoner = document.querySelector('.input-summoner');
const buttonSubmitSummoner = document.querySelector('.button-submit-summoner');
const regionSummoner = document.querySelector('.region-summoner');

let ACCOUNT_ID;
let SUMMONER_ID;
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
const loadingMatches = document.querySelector('.loading-matches');

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

let arrayChampionMastery = [];

async function fetchChampionMastery() {
    try {
        resetButtonsBackgroundColor();
        resetSummonerInfo();
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
        await displayChampionMastery(data);
        loadingSummonerInfo.style.display = 'none';
        championMastery.style.display = 'block';
        arrayChampionMastery.forEach(mastery => championMastery.insertAdjacentElement('beforeend', mastery));
        arrayChampionMastery = [];
    } catch (err) {
        console.log('Error in function: fetchChampionMastery');
        console.error(err);
    }
}

async function displayChampionMastery(data) {
    resetChampionMastery();
    let CHAMPION_MASTERY_RANK = 1;
    const mostPlayedChampions = data.slice(0, 5);
    mostPlayedChampions.forEach(champion => {
        const championID = champion.championId;
        for (let i in CHAMPIONS_DATA) {
            if (CHAMPIONS_DATA[i].key == championID) {
                const div = document.createElement('div');
                const divChampionMasteryRank = document.createElement('div');
                const divChampionImage = document.createElement('div');
                const divChampionNameAndTitle = document.createElement('div');
                const divChampionMasteryAndPoints = document.createElement('div');
                const championImage = document.createElement('img');
                const championName = document.createElement('p');
                const championTitle = document.createElement('p');
                const championPoints = document.createElement('p');
                div.className = 'champion';
                divChampionMasteryRank.className = 'champion-mastery-rank';
                divChampionImage.className = 'champion-image';
                divChampionNameAndTitle.className = 'champion-name-title';
                championName.className = 'champion-name';
                championTitle.className = 'champion-title';
                championPoints.className = 'champion-points';
                divChampionMasteryAndPoints.className = 'champion-mastery-points';
                divChampionMasteryRank.innerHTML = `<span style="font-size: 0.75em; position: relative; top: -1.2px; margin-right: 1px">#</span>${CHAMPION_MASTERY_RANK}`;
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
                divChampionImage.appendChild(championImage);
                divChampionNameAndTitle.appendChild(championName);
                divChampionNameAndTitle.appendChild(championTitle);
                divChampionMasteryAndPoints.appendChild(championPoints);
                div.appendChild(divChampionMasteryRank);
                div.appendChild(divChampionImage);
                div.appendChild(divChampionNameAndTitle);
                div.appendChild(divChampionMasteryAndPoints);
                console.log(div);
                arrayChampionMastery.push(div);
                // championMastery.appendChild(div);
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
    while (championMastery.firstChild) {
        championMastery.removeChild(championMastery.firstChild);
    }
}






let MATCH_HISTORY = [];
let MATCHES_CURRENT_START_INDEX = 0;
let MATCHES_CURRENT_END_INDEX = 5;

const buttonLoadMoreMatches = document.querySelector('.button-load-more-matches');
buttonLoadMoreMatches.addEventListener('click', () => {
    fetchMatches(MATCHES_CURRENT_START_INDEX, MATCHES_CURRENT_END_INDEX);
});

async function fetchMatchHistory() {
    try {
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
        await fetchMatches(MATCHES_CURRENT_START_INDEX, MATCHES_CURRENT_END_INDEX);
    } catch (err) {
        console.log('Error in function: fetchMatchHistory');
        console.error(err);
    }
}

async function fetchMatches(startIndex, endIndex) {
    try {
        let MATCHES_ID = [];
        let MATCHES_ID_ORDER = [];
        let lastFiveMatches = MATCH_HISTORY.slice(startIndex, endIndex);
        lastFiveMatches.map(match => MATCHES_ID.push(match.gameId));
        MATCHES_ID_ORDER = MATCHES_ID.sort();
        loadingMatches.style.display = 'block';
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
        loadingMatches.style.display = 'none';
        arrayMatches.reverse();
        if (startIndex === 0) {
            arrayMatches.forEach(match => matchHistory.insertAdjacentElement('beforeend', match));
            arrayMatches = [];
        } else {
            arrayMatches.forEach(match => matchHistory.insertAdjacentElement('beforeend', match));
            arrayMatches = [];
        }
        MATCHES_CURRENT_START_INDEX += 5;
        MATCHES_CURRENT_END_INDEX += 5;
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
    const match = document.createElement('div');
    const matchDuration = document.createElement('div');
    const build = document.createElement('div');
    const spells = document.createElement('div');
    const runes = document.createElement('div');
    const mapAndGameMode = document.createElement('div');
    const summonerName = document.createElement('p');
    const summonerScore = document.createElement('p');
    const summonerKDA = document.createElement('p');
    const summonerLevel = document.createElement('p');
    const creepScore = document.createElement('p');
    const creepScorePerMinute = document.createElement('div');
    const goldEarned = document.createElement('p');
    const championPlayed = document.createElement('img');
    const matchOutcome = document.createElement('div');
    const killParticipation = document.createElement('div');
    const patch = document.createElement('p');
    const matchDate = document.createElement('div');
    match.className = 'match';
    build.className = 'build';
    spells.className = 'spells';
    runes.className = 'runes';
    console.log(matchData);
    console.log(playerData);
    for (let i in CHAMPIONS_DATA) {
        if (CHAMPIONS_DATA[i].key == playerData.championId) {
            summonerName.innerHTML = CHAMPIONS_DATA[i].name;
            summonerScore.innerHTML = `Kills: ${playerData.stats.kills}. Deaths: ${playerData.stats.deaths}. Assists: ${playerData.stats.assists}.`;
            summonerKDA.innerHTML = `KDA: ${((playerData.stats.kills + playerData.stats.assists) / playerData.stats.deaths).toFixed(1)}`;
            summonerLevel.innerHTML = `Level: ${playerData.stats.champLevel}`;
            creepScore.innerHTML = `CS: ${playerData.stats.totalMinionsKilled}`;
            goldEarned.innerHTML = `Gold: ${(playerData.stats.goldEarned/1000).toFixed(1)}k`;
            championPlayed.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/champion/${CHAMPIONS_DATA[i].id}.png`;
            championPlayed.alt = CHAMPIONS_DATA[i].name;


            // let matchDuration = 973 * 1000;
            // console.log(matchDuration)
            // let timestamp = Number(1600820981769 + matchDuration);
            // // const timestamp = 1600820981769;
            // let DATE = new Date(timestamp);
            // console.log(DATE);

            const getMatchDate = (matchCreation, matchDuration) => {
                let date = document.createElement('p');
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
                console.log(differenceInSeconds);
                console.log(interval);
                const number = Math.floor(differenceInSeconds / interval.seconds);
                console.log(number);
                let labelGrammar = number !== 1 ? 's' : '';
                date.innerHTML = `${number} ${interval.label}${labelGrammar} ago.`;
                console.log(`${number} ${interval.label}${labelGrammar} ago.`)
                return date;
            };
            matchDate.appendChild(getMatchDate(matchData.gameCreation, matchData.gameDuration));

            let MATCH_MINUTES;
            let MATCH_SECONDS;

            const getMatchDuration = matchDurationInSeconds => {
                let duration = document.createElement('p');
                let minutes = Math.floor(matchDurationInSeconds / 60);
                let seconds = matchDurationInSeconds - minutes * 60;
                let minutesFixed = minutes < 10 ? `0${minutes}` : minutes;
                let secondsFixed = seconds < 10 ? `0${seconds}` : seconds;
                duration.innerHTML = `Match duration: ${minutesFixed}:${secondsFixed}`;
                MATCH_MINUTES = minutesFixed;
                MATCH_SECONDS = secondsFixed;
                return duration;
            };
            matchDuration.appendChild(getMatchDuration(matchData.gameDuration));
            
            const getCreepScorePerMinute = (minionsKilled, matchMinutes, matchSeconds) => {
                let data = document.createElement('p');
                let matchDuration = parseFloat(`${matchMinutes}.${matchSeconds}`);
                let calculation = `${minionsKilled / matchDuration}`;
                data.innerHTML = `CS per minute: ${calculation.slice(0, calculation.indexOf('.') + 2)}`;
                return data;
            };
            creepScorePerMinute.appendChild(getCreepScorePerMinute(playerData.stats.totalMinionsKilled, MATCH_MINUTES, MATCH_SECONDS));

            const playerKillsAndAssists = playerData.stats.kills + playerData.stats.assists;
            const getKillParticipation = (players, playerTeam, playerKillsAndAssists) => {
                let teamTotalKills = 0;
                let data = document.createElement('p');
                players.map(player => {
                    const playerStats = Object.entries(player);
                    playerStats.forEach(index => {
                        const key = index[0];
                        const value = index[1];
                        if (key === 'stats') {
                            if (value.win === playerTeam) {
                                teamTotalKills += value.kills;
                                data.innerHTML = `Kill participation: ${Math.round((playerKillsAndAssists / teamTotalKills) * 100)}%`;
                            }
                        }
                    });
                });
                return data;
            };
            killParticipation.appendChild(getKillParticipation(matchData.participants, playerData.stats.win, playerKillsAndAssists));

            const getMatchOutcome = (teams, playerResult, matchDurationInSeconds) => {
                let data = document.createElement('p');
                teams.map(team => {
                    if (team.win === 'Win') {
                        if (matchDurationInSeconds < 270 && team.inhibitorKills == '0') {
                            data.innerHTML = 'Remake';
                            matchOutcome.style.backgroundColor = '#8a8a8a';
                            return;
                        }
                        const winnerTeam = team.teamId;
                        if (winnerTeam == playerResult) {
                            console.log('-------------');
                            console.log(`Winner team: ${winnerTeam} - Player team: ${playerResult}`);
                            console.log('PLAYER HAS WON THE GAME.');
                            matchOutcome.style.backgroundColor = '#1cb329';
                            data.innerHTML = 'Victory';
                        } else {
                            console.log('-------------');
                            console.log(`Winner team: ${winnerTeam} - Player team: ${playerResult}`);
                            console.log('PLAYER HAS LOST THE GAME');
                            matchOutcome.style.backgroundColor = '#cf1821';
                            data.innerHTML = 'Defeat';
                        }
                    }
                });
                return data;
            };
            matchOutcome.appendChild(getMatchOutcome(matchData.teams, playerData.teamId, matchData.gameDuration));

            const getPatchMatchWasPlayed = patchDescription => {
                let patchMatchOccured = document.createElement('p');
                const season = patchDescription.split('.').slice(0, 1);
                const patch = patchDescription.split('.').slice(1, 2);
                patchMatchOccured.innerHTML = `Played on patch ${season}.${patch}`;
                return patchMatchOccured;
            };
            patch.appendChild(getPatchMatchWasPlayed(matchData.gameVersion));

            QUEUE_DATA.map(queue => {
                if (queue.queueId == matchData.queueId) {
                    const map = document.createElement('p');
                    const description = document.createElement('p');
                    map.innerHTML = queue.map;
                    const rawDescription = queue.description;
                    const wordsToBeRemoved = ['5v5', 'games'];
                    let descriptionFixed = rawDescription;
                    wordsToBeRemoved.map(word => {
                        descriptionFixed = descriptionFixed.replace(word, '');
                    });
                    description.innerHTML = descriptionFixed;
                    mapAndGameMode.appendChild(map);
                    mapAndGameMode.appendChild(description);
                }
            });

            const buildItems = [
                {item0: playerData.stats.item0},
                {item1: playerData.stats.item1},
                {item2: playerData.stats.item2},
                {item3: playerData.stats.item3},
                {item4: playerData.stats.item4},
                {item5: playerData.stats.item5},
                {item6: playerData.stats.item6}
            ];
            buildItems.map(item => {
                const itemID = Object.values(item);
                const itemImage = document.createElement('img');
                if (itemID != '0') {
                    itemImage.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/item/${itemID}.png`;
                }
                build.appendChild(itemImage);
            });

            const summonerSpells = [
                {spell1: playerData.spell1Id},
                {spell2: playerData.spell2Id}
            ];
            summonerSpells.map(spell => {
                const spellID = Number(Object.values(spell));
                for (let i in SPELLS_DATA) {
                    if (SPELLS_DATA[i].key == spellID) {
                        const spellImage = document.createElement('img');
                        spellImage.src = `https://ddragon.leagueoflegends.com/cdn/${CURRENT_VERSION}/img/spell/${SPELLS_DATA[i].id}.png`;
                        spellImage.alt = SPELLS_DATA[i].name;
                        spells.appendChild(spellImage);
                    }
                }
            });

            RUNES_DATA.map(tree => {
                tree.slots.map(rune => {
                    rune.runes.map(keystone => {
                        if (keystone.id == playerData.stats.perk0) {
                            const primaryKeystoneImage = document.createElement('img');
                            primaryKeystoneImage.src = `https://ddragon.leagueoflegends.com/cdn/img/${keystone.icon}`;
                            primaryKeystoneImage.alt = keystone.name;
                            runes.appendChild(primaryKeystoneImage);
                        }
                    });
                });
            });
            RUNES_DATA.map(tree => {
                if (tree.id == playerData.stats.perkSubStyle) {
                    const secondaryRune = document.createElement('img');
                    secondaryRune.src = `https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`
                    secondaryRune.alt = tree.name;
                    runes.appendChild(secondaryRune);
                }
            });

        }
    }
    match.appendChild(matchDate);
    match.appendChild(summonerName);
    match.appendChild(summonerScore);
    match.appendChild(summonerKDA);
    match.appendChild(killParticipation);
    match.appendChild(summonerLevel);
    match.appendChild(matchDuration);
    match.appendChild(matchOutcome);
    match.appendChild(creepScore);
    match.appendChild(creepScorePerMinute);
    match.appendChild(goldEarned);
    match.appendChild(championPlayed);
    match.appendChild(mapAndGameMode);
    match.appendChild(build);
    match.appendChild(spells);
    match.appendChild(runes);
    match.appendChild(patch);
    arrayMatches.push(match);
}


// WHEN GAME WAS PLAYED
// match played 1 hour ago
// match played 19 hours ago
// match played 1 day ago
// match played 17 days ago
// match played one month ago
// match played three months ago


// ROLE PLAYER WAS PLAYING
// if summoner's rift
// if not coop vs ai
// get role (top, jungler, mid, adc, support)
// blind pick - 430
// draft pick - 400
// ranked solo - 420
// ranked flex - 440
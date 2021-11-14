if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const LEAGUEOFLEGENDS_API_KEY = process.env.LEAGUEOFLEGENDS_API_KEY;
let REGION;

const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/', async (request, response) => {
    try {
        REGION = request.body.region;
        const summonerURL = `https://${REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${request.body.summoner}?api_key=${LEAGUEOFLEGENDS_API_KEY}`;
        const summonerResponse = await fetch(summonerURL);
        const summonerData = await summonerResponse.json();
        if (!summonerResponse.ok) {
            if (summonerResponse.status === 404) {
                throw new Error(404);
            }
            throw new Error('Unable to fetch the data from the Summoner API');
        }
        response.json(summonerData);
    } catch (err) {
        console.log(err.message);
        response.json(['Error', err.message]);
    }
});

app.post('/ranked', async (request, response) => {
    try {
        const rankedURL = `https://${REGION}.api.riotgames.com/lol/league/v4/entries/by-summoner/${request.body.summonerId}?api_key=${LEAGUEOFLEGENDS_API_KEY}`;
        const rankedResponse = await fetch(rankedURL);
        if (!rankedResponse.ok) throw new Error('Unable to fetch data from the League API');
        const rankedData = await rankedResponse.json();
        response.json(rankedData);
    } catch (err) {
        console.log(`Error in RANKED: ${err.message}`);
        response.json(['Error', err.message]);
    }
});

app.post('/champion-mastery', async (request, response) => {
    try {
        const masteryURL = `https://${REGION}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${request.body.summonerId}?api_key=${LEAGUEOFLEGENDS_API_KEY}`;
        const masteryResponse = await fetch(masteryURL);
        if (!masteryResponse.ok) throw new Error('Unable to fetch data from the Champion Mastery API');
        const masteryData = await masteryResponse.json();
        response.json(masteryData);
        console.log(masteryURL)
    } catch (err) {
        console.log(`Error in CHAMPION MASTERY: ${err.message}`);
        response.json(['Error', err.message]);
    }
});

// MATCH HISTORY USED MATCH-V4 API, WHICH HAS BEEN DEPRECATED.
// THIS PORTION OF THE APP NEEDS TO BE REDONE.

app.post('/match-history', async (request, response) => {
    try {
        console.log(request.body);
        // below is the URL using match-v4:
        // const matchHistoryURL = `https://${REGION}.api.riotgames.com/lol/match/v4/matchlists/by-account/${request.body.accountId}?api_key=${LEAGUEOFLEGENDS_API_KEY}`;
        // below is the URL using match-v5:
        const matchHistoryURL = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${request.body.puuId}/ids?start=0&count=5&api_key=${LEAGUEOFLEGENDS_API_KEY}`;
        const matchHistoryResponse = await fetch(matchHistoryURL);
        console.log(matchHistoryURL);
        const matchHistoryData = await matchHistoryResponse.json();
        if (!matchHistoryResponse.ok) throw new Error('Unable to fetch data from the Match History API');
        response.json(matchHistoryData);
    } catch (err) {
        console.log(`Error in MATCH HISTORY: ${err.message}`);
        response.json(['Error', err.message]);
    }
});

app.post('/match', async (request, response) => {
    try {
        const matchURL = `https://${REGION}.api.riotgames.com/lol/match/v4/matches/${request.body.matchId}?api_key=${LEAGUEOFLEGENDS_API_KEY}`;
        const matchResponse = await fetch(matchURL);
        const matchData = await matchResponse.json();
        if (!matchResponse.ok) throw new Error(`Unable to fetch data from the match ${request.body.matchId}`);
        response.json(matchData);
    } catch (err) {
        console.log(err.message);
        response.json(err.message)
    }
});

app.listen(port, () => console.log('Server updated.'));
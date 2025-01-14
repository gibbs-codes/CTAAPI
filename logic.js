require('dotenv').config();
const axios = require('axios');
const moment = require('moment-timezone');

function sortTrain(trains) {
    let south = [];
    let north = [];
    trains.forEach(train => {
        if(train.destNm === 'Loop' || train.destNm === '95th/Dan Ryan') south.push(minutesAway(train.arrT))
        else north.push(minutesAway(train.arrT))
    })
    const result = {south: south.slice(0,4), north: north.slice(0,4)};
    return result;
}

function sortBuses(eastBus, westBus){
    let busEast = eastBus.map(({prdctdn}) => (prdctdn));
    let busWest = westBus.map(({prdctdn}) => (prdctdn));
    const result = {east: busEast.slice(0,4), west: busWest.slice(0,4)};
    return result;
}

function minutesAway(time) {
    let now = moment().tz('America/Chicago');
    let arrival = moment.tz(time, 'America/Chicago'); // Ensure the arrival time is parsed in the correct time zone
    console.log(`Current time (Chicago): ${now.format()}`);
    console.log(`Arrival time (Chicago): ${arrival.format()}`);
    let diff1 = moment.duration(arrival.diff(now));
    let diff2 = moment.duration(now.diff(arrival));
    const diff = diff1.asMinutes() > 0 ? diff1 : diff2;
    let minutes = diff.asMinutes();
    console.log(`Difference in minutes: ${minutes}`);
    return Math.floor(minutes).toString();
}

async function getBus() {
    try {
        const eastBuses = await axios.get(`https://www.ctabustracker.com/bustime/api/v3/getpredictions?key=${process.env.BUS_KEY}&rt=77&stpid=17379&format=json`)
        const westBuses = await axios.get(`https://www.ctabustracker.com/bustime/api/v3/getpredictions?key=${process.env.BUS_KEY}&rt=77&stpid=17380&format=json`)
        return sortBuses(eastBuses.data['bustime-response'].prd, westBuses.data['bustime-response'].prd);
    } catch (err) {
        console.error('Error fetching bus data:', err);
    }
}

async function getRedLine() {
    try {
        const response = await axios.get(`http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${process.env.TRAIN_KEY}&mapid=41320&rt=Red&outputType=JSON`)
        return sortTrain(response.data.ctatt.eta);
    } catch (err) {
        console.error('Error fetching red line data:', err);
    }
}

async function getBrownLine() {
    try {    
        const response = await axios.get(`http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${process.env.TRAIN_KEY}&mapid=41320&rt=brn&outputType=JSON`)
        return sortTrain(response.data.ctatt.eta);
    } catch (err) {
        console.error('Error fetching brown line data:', err);
    }
}

async function doAll() {
    const buses = await getBus();
    const red = await getRedLine();
    const brown = await getBrownLine();
    const result = {buses: buses, red: red, brown: brown};
    return await result;
}

module.exports = doAll;
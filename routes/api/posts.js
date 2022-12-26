const express = require('express');
const mongodb = require('mongodb');
const router = express.Router();


// Get User Info
router.get('/user/:id', async (req, res) => {
    const posts = await LoadCollection('fairplay_rp', 'users');
    let data = await posts.findOne({id: parseInt(req.params.id)}, {projection: {userMoney: 1, id: 1, userFaction: 1, userIdentity: 1, username: 1, adminLvl:1, hoursPlayed: 1, vipLvl: 1, userBans: 1, last_login: 1}});
    res.send(data);
});

router.get('/userhistory/:id', async (req, res) => {
    const data = await LoadCollection('fairplay_rp', 'userHistory');
    res.send(await data.find({user_id: parseInt(req.params.id)}).toArray());
});

router.get('/userpunishlog/:id', async (req, res) => {
    const data = await LoadCollection('fairplay_rp', 'punishLogs');
    res.send(await data.find({user_id: parseInt(req.params.id)}).toArray());
});

router.get('/userVehicles/:id', async (req, res) => {
    let VehiclesCollection = await LoadCollection('fairplay_rp', 'userVehicles');
    let data = await VehiclesCollection.find({user_id: parseInt(req.params.id)}).toArray();
    res.send(data);
});

// Basic Informations

let UsersData = []
let ServerVehicles = []
let RecentActions = []

// Get Data from Database functions

async function GetDataFromDB() {
    let UsersCollection = await LoadCollection('fairplay_rp', 'users');
    UsersData = await UsersCollection.find({}, {projection: {userMoney: 1, id: 1, userRaport: 1,  userFaction: 1, userIdentity: 1, username: 1, adminLvl:1, hoursPlayed: 1, vipLvl: 1, userBans: 1, last_login: 1}}).toArray();
    setTimeout(GetDataFromDB, 15000);
} GetDataFromDB();

async function GetServerInfo() {
    let VehiclesCollection = await LoadCollection('fairplay_rp', 'userVehicles');
    let UserHistoryCollection = await LoadCollection('fairplay_rp', 'userHistory');

    ServerVehicles = await VehiclesCollection.find({}).toArray();
    RecentActions = await UserHistoryCollection.find({}).toArray();
    setTimeout(GetServerInfo, 30000);
} GetServerInfo();

// Get Staff Members
router.get('/staff', async (req, res) => {
    res.send(UsersData);
});

router.get('/users', async (req, res) => {
    res.send(UsersData);
});

router.get('/vehicles', async (req, res) => {
    res.send(ServerVehicles);
});

router.get('/recentactions', async (req, res) => {
    res.send(RecentActions);
});

// Server Logs
router.get('/serverLogs/:id/:type', async (req, res) => {
    let id = req.params.id
    let type = req.params.type

    const data = await LoadCollection('fairplay_rp', 'serverLogs');
    res.send(await data.find({user_id: parseInt(id), type: type.toString()}).toArray());
});

router.get('/getServerLogsData/:id/:type/:info', async (req, res) => {
    let id = req.params.id;
    let type = req.params.type;
    let logData = req.params.info;

    const data = await LoadCollection('fairplay_rp', 'serverLogs');
    res.send(await data.find({user_id: parseInt(id), type: type.toString(), data: logData.toString()}).toArray());
});

router.get('/getServerLogsTarget/:id/:type/:info/:target', async (req, res) => {
    let id = req.params.id;
    let type = req.params.type;
    let logData = req.params.info;
    let target = req.params.target;

    const data = await LoadCollection('fairplay_rp', 'serverLogs');
    res.send(await data.find({user_id: parseInt(id), type: type.toString(), data: logData.toString(), target_id: parseInt(target)}).toArray());
});

async function LoadCollection(db, collection) {
    const client = await mongodb.MongoClient.connect("mongodb://Administrator:satibagmuiecorkysugipula123@185.225.3.114:27017/?authMechanism=SCRAM-SHA-1&authSource=fairplay_rp", {
        useNewUrlParser: true
    });

    return client.db(db).collection(collection);
}

module.exports = router;
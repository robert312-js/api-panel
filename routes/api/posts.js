const express = require('express');
const router = express.Router();
const mongodb = require('../../utils/mongodb.js');

// Get User Info
router.get('/user/:id', async (req, res) => {
    const posts = await mongodb.LoadCollection('users');
    let data = await posts.findOne({id: parseInt(req.params.id)}, {projection: {userMoney: 1, id: 1, userFaction: 1, userIdentity: 1, username: 1, adminLvl:1, hoursPlayed: 1, vipLvl: 1, userBans: 1, last_login: 1}});
    res.send(data);
});

router.get('/userhistory/:id', async (req, res) => {
    const data = await mongodb.LoadCollection('userHistory');
    res.send(await data.find({user_id: parseInt(req.params.id)}).toArray());
});

router.get('/userpunishlog/:id', async (req, res) => {
    const data = await mongodb.LoadCollection('punishLogs');
    res.send(await data.find({user_id: parseInt(req.params.id)}).toArray());
});

router.get('/userVehicles/:id', async (req, res) => {
    let VehiclesCollection = await mongodb.LoadCollection('userVehicles');
    let data = await VehiclesCollection.find({user_id: parseInt(req.params.id)}).toArray();
    res.send(data);
});

// Basic Informations
let UsersData = []
let ServerVehicles = []
let RecentActions = []

// Get Data from Database functions

async function GetDataFromDB() {
    let UsersCollection = await mongodb.LoadCollection('users');
    UsersData = await UsersCollection.find({}, {projection: {userMoney: 1, id: 1, userRaport: 1,  userFaction: 1, userIdentity: 1, username: 1, adminLvl:1, hoursPlayed: 1, vipLvl: 1, userBans: 1, last_login: 1}}).toArray();
    setTimeout(GetDataFromDB, 15000);
} 

GetDataFromDB();

async function GetServerInfo() {
    let VehiclesCollection = await mongodb.LoadCollection('userVehicles');
    let UserHistoryCollection = await mongodb.LoadCollection('userHistory');
    ServerVehicles = await VehiclesCollection.find({}).toArray();
    RecentActions = await UserHistoryCollection.find({}).toArray();
    setTimeout(GetServerInfo, 30000);
} 
GetServerInfo();

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

    const data = await mongodb.LoadCollection('serverLogs');
    res.send(await data.find({user_id: parseInt(id), type: type.toString()}).sort({time:-1}).toArray());
});

router.get('/getServerLogsData/:id/:type/:info', async (req, res) => {
    let id = req.params.id;
    let type = req.params.type;
    let logData = req.params.info;

    const data = await mongodb.LoadCollection('serverLogs');
    res.send(await data.find({user_id: parseInt(id), type: type.toString(), data: logData.toString()}).sort({time:-1}).toArray());
});

router.get('/getUdata/:id', async (req, res) => {
    let id = req.params.id;
    const data = await mongodb.LoadCollection('uData')
    const chest_data = "vRP:datatable";
    res.send(await data.findOne({user_id: parseInt(id), dkey: chest_data}));
});

router.get('/getVehicleChest/:id/:vehicle/:chest', async (req, res) => {
    let user_id = req.params.id;
    let vehicle = req.params.vehicle;
    let chestType = req.params.chest;
    if (chestType == "chest") {
        const info = 'chest:vehTrunk_' + vehicle + '_u' + user_id;
        const data = await mongodb.LoadCollection('sData')
        res.send(await data.findOne({dkey: info}));
    } else {
        const info = 'chest:vehGlovebox_' + vehicle + "_u" + user_id;
        const data = await mongodb.LoadCollection('sData')
        res.send(await data.findOne({dkey: info}));

    };
});

router.get('/getServerLogsTarget/:id/:type/:info/:target', async (req, res) => {
    let id = req.params.id;
    let type = req.params.type;
    let logData = req.params.info;
    let target = req.params.target;

    const data = await mongodb.LoadCollection('serverLogs');
    res.send(await data.find({user_id: parseInt(id), type: type.toString(), data: logData.toString(), target_id: parseInt(target)}).sort({time:-1}).toArray());
});

module.exports = router;
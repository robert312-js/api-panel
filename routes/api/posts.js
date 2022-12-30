const express = require('express');
const router = express.Router();
const mongodb = require('../../utils/mongodb.js');

var UsersData = {}
var StaffMembers = []
var BannedUsers = []

var DashboardData = {
    history: [],
    totalVehicles : 0,
    totalUsers : 0,
    totalVips : 0,
    users : [],
}

async function UpdateServerData() {
    // Collections
    let UsersCollection = await mongodb.LoadCollection('users');
    let VehiclesCollection = await mongodb.LoadCollection('userVehicles');
    let UsersHistoryCollection = await mongodb.LoadCollection('userHistory');
    let PunishLogsCollection = await mongodb.LoadCollection('punishLogs');
    let UDataCollection = await mongodb.LoadCollection('uData')

    // Clear Cache Data
    StaffMembers = []
    BannedUsers = []
    DashboardData = {
        history: [],
        totalVehicles : 0,
        totalUsers : 0,
        totalVips : 0,
        users : [],
    }

    // Users table'
    let usersData = await UsersCollection.find({}, {projection: {userMoney: 1, id: 1, userFaction: 1, userIdentity: 1, username: 1, adminLvl:1, hoursPlayed: 1, vipLvl: 1, userBans: 1, last_login: 1}}).toArray();
    for (const user of usersData) {
        // Initialize the array for this user if it is not defined
        UsersData[user.id] = {
            data: [],
            vehData: [],
            history: [],
            punishLog: [],
            inventory : [],
        };
        UsersData[user.id].data = user;
        DashboardData.totalUsers++;
        if (user.adminLvl > 0) {
            StaffMembers.push({
                id: user.id,
                name: user.username,
                adminLvl: user.adminLvl,
                lastLogin: mongodb.GetLuaTimestamp(user.last_login),
                hoursPlayed: user.hoursPlayed.toFixed(2),
            })
        }
        if (user.userBans) {
            BannedUsers.push({
                userName: user.username,
                userBans: user.userBans,
            })
        }
        DashboardData.users.push(user)
        if (user.vipLvl > 0) {
            DashboardData.totalVips++;
        }
    }
    // Vehicles table
    let vehiclesData = await VehiclesCollection.find({}).toArray();
    for (const vehicle of vehiclesData) {
        if (!UsersData[vehicle.user_id]) {
            continue
        };
        UsersData[vehicle.user_id].vehData.push(vehicle);
        DashboardData.totalVehicles++
    }
    let usersHistoryData = await UsersHistoryCollection.find({}).sort({time:-1}).toArray();
    for (const history of usersHistoryData) {
        if (!UsersData[history.user_id]) {
            continue
        };
        UsersData[history.user_id].history.push(history);
        DashboardData.history.push(history);
    }
    let punishLogsData = await PunishLogsCollection.find({}).toArray();
    for (const punishLog of punishLogsData) {
        if (!UsersData[punishLog.user_id]) {
            continue
        }
        UsersData[punishLog.user_id].punishLog.push(punishLog);
    }
    let uData = await UDataCollection.find({dkey: "vRP:datatable"}).toArray();
    for (const data of uData) {
        if (!UsersData[data.user_id]) {
            continue
        }
        if (!data.dvalue) {
            continue
        }
        let invData = JSON.parse(data.dvalue);
        if (invData == null) {
            continue
        }
        if ('inventory' in invData == false) {
            continue
        }
        let inventoryData = invData.inventory;
        for (const [key, item] of Object.entries(inventoryData)) {
            UsersData[data.user_id].inventory.push({
                name: key,
                amount: item.amount,
            })    
        }
    }

    console.log("Server Data Updated!")
    // Update the cache every 5 minutes
    setTimeout(UpdateServerData, 30000);
} UpdateServerData();

// [GET ROUTING] 

router.get('/user/:id', async (req, res) => {
    res.send(UsersData[req.params.id]);
});

router.get('/staff', async (req, res) => {
    res.send(StaffMembers);
});

router.get('/bans', async (req, res) => {
    res.send(BannedUsers);
});

router.get('/dashboard', async (req, res) => {
    res.send(DashboardData);
})

router.get("/admin", express.urlencoded({ extended: false }), async (req, res) => {
    if (req.session.authenticated) {
        let user_id = req.session.user['id']
        let playerData = UsersData[user_id];
        if (!playerData) {
            return
        };
        let userData = playerData.data;
        if (userData['adminLvl'] >= 1) {
            res.status(201).json({
                isAdmin: true,
                adminLvl: userData['adminLvl'],
                adminId: userData['id']
            })
        } else {
            res.status(201).json({
                isAdmin: false,
            })
        }
    }
});

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

router.get('/getServerLogsTarget/:id/:type/:info/:target', async (req, res) => {
    let id = req.params.id;
    let type = req.params.type;
    let logData = req.params.info;
    let target = req.params.target;

    const data = await mongodb.LoadCollection('serverLogs');
    res.send(await data.find({user_id: parseInt(id), type: type.toString(), data: logData.toString(), target_id: parseInt(target)}).sort({time:-1}).toArray());
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

module.exports = router;
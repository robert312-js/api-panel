const express = require('express');
const router = express.Router();
const mongodb = require('../../utils/mongodb.js');

var LastUpdated = 0;
var ServerStats = {};

ServerStats['totalMoney'] = {};
ServerStats['totalCash'] = {};
ServerStats['totalBank'] = {};

ServerStats['maxBankMoney'] = 0;
ServerStats['maxCashMoney'] = 0;

async function InsertServerStats() {
    try {
      setTimeout(InsertServerStats, 3000);
      let userCollection = await mongodb.LoadCollection('users');
      let usersData = await userCollection.find({}).toArray();
  
      console.log(LastUpdated > Date.now())

      if (LastUpdated > Date.now()) {
          return;
      }
      var totalMoney = 0;
      var totalCash = 0;
      var totalBank = 0;
      for (const user of usersData) {
        if (user['userMoney'] == undefined) {
          continue;
        }
        let cashMoney = user['userMoney'].walletMoney ? user['userMoney'].walletMoney : 0;
        let bankMoney = user['userMoney'].bankMoney ? user['userMoney'].bankMoney : 0;
           // Total Money
          totalMoney += Math.floor(cashMoney + bankMoney);
          // Total Cash
          totalCash += cashMoney;
          // Total Bank
          totalBank += bankMoney  

          ServerStats['maxBankMoney'] = totalMoney;
          ServerStats['maxCashMoney'] = totalCash;
        }
        GetPlayersMediumMoney()
    LastUpdated = Date.now() + 18000000 // 5 hours seconds
    let serverStatsCollection = await mongodb.LoadCollection('serverStats2', 'panel_database');

    // await serverStatsCollection.insertOne({
    //     timestamp: Date.now(),
    //     date: GetDate(Date.now()),
    //     totalMoney: totalMoney,
    //     totalCash: totalCash,
    //     totalBank: totalBank,
    // });
    } catch (error) {
      console.error(error);
    }
  } 
  
  InsertServerStats();

  async function GetPlayersMediumMoney() {
    try {
        let usersCollection = await mongodb.LoadCollection('users');
        let usersData = await usersCollection.find({}).toArray()
        let usersNumber = 0;
        let totalMoney = 0;

        for (const data of usersData) {
          if (data['hoursPlayed'] >= 10) {
            if (data['userMoney'] == undefined) {
              continue;
            }
            usersNumber++;
            let cashMoney = data['userMoney'].walletMoney ? data['userMoney'].walletMoney : 0;
            let bankMoney = data['userMoney'].bankMoney ? data['userMoney'].bankMoney : 0;

            totalMoney += Math.floor(cashMoney + bankMoney);
          }
        }
        console.log(totalMoney, usersNumber)
        ServerStats['mediumMoney'] = Math.floor(totalMoney / usersNumber);
    } catch (error) {
        console.error(error);
    }
}
async function GetServerStats() {
    try {
        const serverStatsCollection = await mongodb.LoadCollection('serverStats2', 'panel_database');
        const serverStatsData = await serverStatsCollection.find({}).sort({ timestamp: -1 }).toArray();
    
        serverStatsData.forEach((info) => {
          ServerStats.totalMoney[info.date]= {
            money: info.totalMoney,
            time: info.timestamp
          }
          ServerStats.totalCash[info.date] = {
            money: info.totalCash,
            time: info.timestamp
          };
          ServerStats.totalBank[info.date] = {
            money: info.totalBank,
            time: info.timestamp
          };
        });
        setTimeout(GetServerStats, 30000);
      } catch (error) {
        console.error(error);
      }
} GetServerStats();

router.get('/serverStats', async (req, res) => {
    res.send(ServerStats);
});

function GetDate(timestamp) {
    var a = new Date(timestamp);
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var hour = a.getHours() > 12 ? a.getHours() - 12 : a.getHours() < 10 ? "0" + a.getHours() : a.getHours();
    var min = a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes();
    var time = date + "/" + month + "/" + hour + ":" + min;
    return time;
}


module.exports = router;
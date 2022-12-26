const express = require('express');
const router = express.Router();
const mongodb = require('mongodb');

const Q3RCon = require('quake3-rcon');

var rcon = new Q3RCon({
  address: "185.225.3.114",
  port: "30120",
  password: 'fairplaysuntsmecherivaliegay2323',
});

router.post('/rcon', express.urlencoded({ extended: false }), async (req, res) => {
    const command = req.body.command;
    if (req.session.user) {
        let user_id = req.session.user['id']
        let collectionData = await LoadCollection('fairplay_rp', 'users')
        let userData = await collectionData.findOne({id: parseInt(user_id)})
        if (userData['adminLvl'] >= 1) {
            if (command) {
            rcon.send(command, (response) => {
                return;
              });
            res.status(200).send({message: "Command sent!"});
            }
        } else  {
            res.status(201).send({message: "You are not authorized to use this command!"});
        }
    }
});

async function LoadCollection(db, collection) {
    const client = await mongodb.MongoClient.connect("mongodb://Administrator:satibagmuiecorkysugipula123@185.225.3.114:27017/?authMechanism=SCRAM-SHA-1&authSource=fairplay_rp", {
        useNewUrlParser: true
    });

    return client.db(db).collection(collection);
}


module.exports = router;
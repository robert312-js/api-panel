const mongodb = require('mongodb');

module.exports.LoadCollection = function(collectionName, database) {
    return new Promise( async (resolve, reject) => {
        const client = await mongodb.MongoClient.connect("mongodb://gagicar:123gagicarcaasavreaueu123321@185.225.3.114:27017/?authMechanism=SCRAM-SHA-1&authSource=admin", {
            useNewUrlParser: true
        });
        if (database != null) {
            const db = client.db(database);
            const collection = db.collection(collectionName);
            resolve(collection);
            return;
        }
  
        const db = client.db('fairplay_rp');
        const collection = db.collection(collectionName);
        resolve(collection);
    });
  }


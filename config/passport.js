const JwtStartegy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const key = require('./keys').secret;
const mongodb = require('mongodb');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = key;

module.exports = passport => {
    passport.use(
        new JwtStartegy(opts, async function (jwt_payload, done) {
            const data = await LoadCollection('fairplay_rp', 'panel_users');
            const user = await data.findOne({user_id: parseInt(jwt_payload.id)});
            if(user) return done(null, user);
            return done(null, false);
        })
    );
};

async function LoadCollection(db, collection) {
    const client = await mongodb.MongoClient.connect('mongodb://Administrator:satibagmuiecorkysugipula123@185.225.3.114:27017/?authMechanism=SCRAM-SHA-1&authSource=fairplay_rp', {
        useNewUrlParser: true
    });

    return client.db(db).collection(collection);
}

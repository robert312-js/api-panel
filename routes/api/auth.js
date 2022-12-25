const express = require('express');
const bcrypt = require('bcrypt');
const mongodb = require('mongodb');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // Verification if already logged in
    if (req.session.authenticated) {
        res.json(req.session)
    } else {
        if (email && password) {
            // Find user by email
            const data = await LoadCollection('fairplay_rp', 'panel_users')
            let userInfo = await LoadCollection('fairplay_rp', 'users')
            const emailExist = await data.findOne({email: email});
            // Check if email exist in database
            if (!emailExist) {
                return res.status(201).json({
                    msg: 'Email-ul nu exista!',
                    success: false
                });
            }
            // Check password
            const validPass = await bcrypt.compare(password, emailExist.password);
            if (validPass) {
                let userData = await userInfo.findOne({id: emailExist.user_id})
                req.session.authenticated = true;
                req.session.user = {
                    id: emailExist.user_id,
                    username: userData['username'],
                };
                console.log("User logged in: " + userData['username'] + ' ' + req.session.authenticated )
                res.status(200).json({
                    success: true,
                    msg: 'Te-ai logat cu succes!',
                    sessionData: req.session
                });
            } else {
                res.status(201).json({
                    msg: 'Parola este gresita!',
                    success: false
                });
            }
        } else {
            res.status(201).json({
                msg: 'Email-ul sau parola sunt gresite!',
                success: false
            });
        }
    }
});

router.post('/register', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let user_code = req.body.code;

    const data = await LoadCollection('fairplay_rp', 'panel_users');
    const hasEmail = await data.findOne({email: email});

    if (hasEmail) {
        return res.status(201).json({
            msg: 'Exista deja un cont cu acest email!',
            status: "error"
        });
    }

    const hasCode = await data.findOne({user_code: user_code});

    if (hasCode) {
       return  res.status(201).json({
            msg: 'Exista deja un cont creat cu acest cont!',
            status: "error"
        });
    }

    const userData = await LoadCollection('fairplay_rp', 'users');
    const user = await userData.findOne({code: user_code});
    
    if (user) {
        let user_id = user.id;
        bcrypt.hash(password, 10, async function(err, hash) {
            await data.insertOne({
                email: email,
                password: hash,
                user_code: user_code,
                user_id: user_id
            });
        });
        return res.status(201).json({
            msg: 'Ti-ai creat cu success contul!',
            status: "success"
        })
    } else {
        return res.status(201).json({
            msg: 'Nu am gasit un cont asociat cu acest cod!',
            status: "error"
        });
    }
});

router.get('/logout', express.urlencoded({ extended: false }), (req, res, next) => {
    req.session.user = null;
    req.session.authenticated = false;

    req.session.save(function (err) {
        if (err) next(err)
    
        req.session.regenerate(function (err) {
          if (err) next(err)
        })
    })
    res.status(200).json({
        msg: 'Ai fost deconectat cu success!',
        success: true
    });
});

router.get('/account', express.urlencoded({ extended: false }), (req, res) => {
    if (req.session.authenticated) {
        res.status(201).json({
            status: "success",
            user: req.session.user
        });
    } else {
        res.status(201).json({
            msg: 'Nu esti logat!',
            status: "not_logged"
        });
    }
})

router.get("/admin", express.urlencoded({ extended: false }), async (req, res) => {
    if (req.session.authenticated) {
        let user_id = req.session.user['id']
        let collectionData = await LoadCollection('fairplay_rp', 'users')
        let userData = await collectionData.findOne({id: parseInt(user_id)})
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

async function LoadCollection(db, collection) {
    const client = await mongodb.MongoClient.connect("mongodb://Administrator:satibagmuiecorkysugipula123@185.225.3.114:27017/?authMechanism=SCRAM-SHA-1&authSource=fairplay_rp", {
        useNewUrlParser: true
    });

    return client.db(db).collection(collection);
}

module.exports = router;
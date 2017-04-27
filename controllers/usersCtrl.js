const db = require('../db'),
      bcrypt = require('bcryptjs'),
      passport = require("../passport.js"),
      _ = require('lodash'),
      userFunc = require('../functions.js'),
      ses = require('../s3'),
      socketCtrl = require('./socketCtrl'),
      io = require('socket.io');

function hash(given) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(given, salt)
}

//TODO fix passing the admin_id
module.exports = {
    createUser: (req, res, next) => {
        const userInfo = {
            email: req.body.email.toLowerCase(),
            password_hash: hash(req.body.password),
            firstname: req.body.firstname.toLowerCase(),
            lastname: req.body.lastname.toLowerCase(),
            company: req.body.company.toLowerCase(),
            admin_id: 1
        }
        const input = {
            Source: "bfletcherbiggs@gmail.com",
            Destination: {
                ToAddresses: ['success@simulator.amazonses.com']
            },
            Message: {
                Subject: {
                    Data: "New Account Created"
                },
                Body: {
                    Html: {
                        Data: `<p>Hello, ${req.body.firstname} ${req.body.lastname} welcome to Goldsage!</p>`
                    },
                    Text: {
                        Data: `Your account has been created.  Please login with the following password. ${req.body.password}`
                    }
                }
            }
        }

        db('users')
        .returning('id')
        .insert(userInfo)
        .then ( response => {
            return db('chats')
            .returning('*')
            .insert({
                user_id:response[0],
                admin_id:req.user.id
            })
            .then(response=>{
                return db('messages')
                .returning('*')
                .insert({
                    user_id:response[0].user_id,
                    chat_id:response[0].id,
                    message:"Welcome to Goldsage!",
                    type:'admin'
                })
                .then(response=>{
                    ses.sendEmail(input, function(err,response){
                        if(err) console.log(err);
                        return userFunc.handleResponse(res,200, 'success',response)
                    })
                })
            })
        })
        .catch( err => {
            console.log(err)
            return userFunc.handleResponse(res,500,'error',err)
        })
    },
    readUser: function(req, res) {
        if (!req.user) {
        }
        delete req.user.password
        userFunc.handleResponse(res,200, 'success',userFunc.returnUser(req.user))
    }
}

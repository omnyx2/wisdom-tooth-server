import "reflect-metadata";
import * as express from "express";
import * as request from 'request';
// import * as socketio from 'socket.io';
import * as http from 'http';
import * as cors from 'cors';
import { createConnection } from "typeorm";
import { Doctor } from "./entity/Doctor";
import { Request } from "./entity/Request";
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
import { doctorController } from './controller/doctor.controller';
import { doctorsController  } from "./controller/doctors.controller";
import { requestController } from "./controller/request.controller";
import { patientController } from "./controller/patient.controller";
import {  asyncBcryptPassword, ensureAuthorized, hasValidToken, asyncBcryptPasswordRaw } from './lib/authLib'

// const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js')


createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "",
    database: "testDB",
    entities: [
        // Photo,
	    Doctor,
	    Request
    ],
    synchronize: true,
}).then(async connection => {
    
    const ServerBasicConfig = {
        port0: 5007,
        port1: 5009
    }
    const server = express();
    // create and setup express app
    const app = express.Router();
      app.use((err, req, res, next) => {
        res.json({ message: err.message} )
    })
    
    server.use(express.json());
    // app.use(bodyParser.urlencoded({ extended: true }));
    // app.use(bodyParser.json());
    // app.use(morgan("dev")); // 모든 요청을 console에 기록
    // app.use(methodOverride()); // DELETE, PUT method 사용
    server.use(function(req, res, next) {
        //모든 도메인의 요청을 허용하지 않으면 웹브라우저에서 CORS 에러를 발생시킨다.
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });

    console.log(`turning on server on : ${ServerBasicConfig.port0}`);
    console.log(`서버가 ${ServerBasicConfig.port1} 에서 시작되었어요`);
    app.use(doctorController.router)
    app.use(doctorsController.router)
    app.use(requestController.router)
    app.use(patientController.router)
    app.get('/tester', async (req, res, next) => {
        res.setHeader("Content-Type", "application/json");
        res.send("test fine!");   
    })

// const chatServer = http.createServer(server)
// const io = socketio(chatServer)
// io.on('connection', (socket) => {
//     console.log('새로운 connection이 발생하였습니다.')
//     socket.on('join', ({ name, room }, callback) => {
//       const { error, user } = addUser({ id: socket.id, name, room })
//       if (error) callback({ error: '에러가 발생했어요.' })
  
//       socket.emit('message', {
//         user: 'admin',
//         text: `${user.name}, ${user.room}에 오신것을 환영합니다.`,
//       })
//       socket.broadcast.to(user.room).emit('message', {
//         user: 'admin',
//         text: `${user.name} 님이 가입하셨습니다.`,
//       })
//       io.to(user.room).emit('roomData', {
//         room: user.room,
//         users: getUsersInRoom(user.room),
//       })
//       socket.join(user.room)
  
//       callback()
//     })
//     socket.on('sendMessage', (message, callback) => {
//       const user = getUser(socket.id)
//       io.to(user.room).emit('message', { user: user.name, text: message })
//       callback()
//     })
//     socket.on('disconnect', () => {
//       const user = removeUser(socket.id)
  
//       if (user) {
//         io.to(user.room).emit('message', {
//           user: 'Admin',
//           text: `${user.name} 님이 방을 나갔습니다.`,
//         })
//         io.to(user.room).emit('roomData', {
//           room: user.room,
//           users: getUsersInRoom(user.room),
//         })
//       }
//       console.log('유저가 떠났어요.')
//     })
//   })

    server.use('/wisdom-tooth-apis', app)
    server.listen(ServerBasicConfig.port0);
    // chatServer.listen(PORT)

}).catch(error => console.log(error));

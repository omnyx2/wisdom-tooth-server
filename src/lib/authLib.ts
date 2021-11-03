import { resolve } from "url";

const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

// 패스워드 암호화를 위한 라이브러리, 회원가입, 로그인시 사용
const saltRounds = 2


export async function asyncBcryptPassword(req, res, next ) {
    
    // 요청 메세지의 데이터(비밀번호) 암호화
    try{
        const hash = await bcrypt.hash(req.body.password, saltRounds)
        req.body.password = hash;
        next()

    } catch(err) {
        console.log(err)
        res.sendStatus(404)
    }
    
}

export async function asyncBcryptPasswordRaw(password) {
    try{
        const hash = await bcrypt.hash(password, saltRounds)
        return hash

    } catch(err) {
        // throw new Error("password BPR error?")
        return "err"
    }

}

export function ensureAuthorized(req, res, next) {

    // 요청시 토큰은 헤더에 담아서 전달 해야함 
    // "authorization: bearer <token> 의 형식을 취할 것"
    try {
        let bearerToken;
        let bearerHeader = req.headers["authorization"];

        if (typeof bearerHeader !== 'undefined') {
            let bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];
            req.token = bearerToken;

        } else {
            res.sendStatus(403)
            // res.send("You Did't send your jwt")
            console.error("[EnsureAuthorized Error!]: missing token");
        }

    } catch(err) {
        res.send("[EnsureAuthorized Error!]:  You Did't send your jwt")
        res.sendStatus(403);
        console.error(err);
    }

    next();
}

export function hasValidToken(req, res, next) {

    const token = req.token;
    if( token !== "error!") {
        try {
            var decoded = jwt.verify(token, 'secret');
            console.log("decoded toekn", decoded);
            next();
        } catch(err) {
            // err
            res.sendStatus(403);
            console.error(err);
        }
    } else {
        res.sendStatus(403);
        console.error(token!);
    }
  }



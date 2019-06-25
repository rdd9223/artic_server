var randtoken = require('rand-token');
const jwt = require('jsonwebtoken');
const secretOrPrivateKey = "jwtSecretKey!";
const options = {
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: "genie"
};
// const refreshOptions = {
//     algorithm: "HS256",
//     expiresIn: "24h * 14",
//     issuer: "genie"
// };

module.exports = {
    sign: (user) => {
        const payload = { //회원 데이터 
            idx: user.idx,
            grade: user.grade,
            name: user.name
        };

        const result = { //return 할 값
            token: jwt.sign(payload, secretOrPrivateKey, options),
            refreshToken: randtoken.uid(256) //안쓰고 싶으면 안써도됨~!

        };
        //refreshToken을 만들 때에도 다른 키를 쓰는게 좋다.

        return result;
    },
    verify: (token) => { //해독 모듈 (에러는 파기된 토큰일 때니까 참고)

        let decoded;
        try {
            decoded = jwt.verify(token, secretOrPrivateKey);
        } catch (err) {
            if (err.message === 'jwt expired') {
                console.log('expired token');
                return -3;
            } else if (err.message === 'invalid token') {
                console.log('invalid token');
                return -2;
            } else {
                console.log("invalid token");
                return -2;
            }
        }
        return decoded;
    },
    refresh: (user) => { //sign이랑 비슷함 

        const payload = {
            idx: user.idx,
            grade: user.grade,
            name: user.name
        };

        return jwt.sign(payload, secretOrPrivateKey, options);
    }
};
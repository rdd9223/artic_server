const crypto = require('crypto');

    const createHash = (str) => {
        const inputStr = str;
        let data = {
            "msg": "",
            "hashed": null
        };
        crypto.randomBytes(32, function(err, buffer) {
            if (err) {
                return null;
            } else {
                //생성된 문자열을 salt 값으로 암호화를 합니다 (반드시 toString으로 문자로 만드시고 해싱해야합니다!!!)
                //해시된 문자열이 나올 경우 콜백함 수가 실행되는데 hashed에 해시된 문자열이 들어갑니다.
                crypto.pbkdf2(inputStr, buffer.toString('base64'), 10000, 64, 'sha512', (err, hashed) => {
                    if (err) {
                        return null;
                    } else {
                        //암호화가 잘 완료된 경우 응답을 보낼 객체에 담습니다.
                        data.hashed = hashed.toString('base64');
                        return data.hashed;
                    }
                });
            }
        });
        
    }
    module.exports = createHash;





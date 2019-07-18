# ARTIC
#### 당신이 찾는 모든 지식 콘텐츠, 아틱(artic)

* 2019 SOPT 24기 해커톤
    *  프로젝트 기간 : 2019년 7월 1일 ~ 2019년 7월 12일
* API - (https://github.com/artic-development/artic_server/wiki)
* 논리적 DB 모델링

![ERD](https://github.com/artic-development/artic_server/blob/master/images/ERD.png)



## Architecture
![Architecture](https://github.com/artic-development/artic_server/blob/master/images/architecture.png)

## Work Flow
![Workflow](./images/workflow.png)

## 프로젝트 설명
* 아틱의 소스코드는 하나의 프로젝트로 구성되어 있으며, 모놀리틱 아키텍쳐 방식을 채택하여 설계했습니다.
* 보안
   * jwt토큰에 유저의 정보를 넣어 DB에 접근하는 횟수를 줄였습니다.
   * Helmet모듈을 사용함으로써 주로 알려진 웹 취약점에 대해 보안을 강화하였습니다.
   * 백엔드 서버에 접속할 때의 보안을 위해 Nginx프로그램을 사용하였습니다.
   * HTTPS/SSL을 적용하여 웹, 인터넷 보안을 보완했습니다.
* 데이터 베이스 (Mongo DB, Maria DB)
   * 알림 부분은 지속적인 수정, 삭제가 아닌 조회를 주로 하기때문에 Mongo DB를 사용했습니다.
   
## 의존성
```
"dependencies": {
    "aws-sdk": "^2.486.0",
    "cookie-parser": "^1.4.4",
    "crypto-promise": "^2.1.0",
    "debug": "^2.6.9",
    "express": "^4.16.4",
    "express-session": "^1.16.2",
    "helmet": "^3.18.0",
    "http-errors": "^1.7.3",
    "jade": "^1.11.0",
    "jsonwebtoken": "^8.5.1",
    "moment": "^2.24.0",
    "moment-timezone": "^0.5.25",
    "mongoose": "^5.6.2",
    "morgan": "^1.9.1",
    "multer": "^1.4.1",
    "multer-s3": "^2.9.0",
    "passport": "^0.4.0",
    "passport-facebook": "^3.0.0",
    "passport-kakao": "0.0.5",
    "passport-local": "^1.0.0",
    "promise-mysql": "^3.3.2",
    "python-shell": "^1.0.7",
    "rand-token": "^0.4.0",
    "request": "^2.88.0",
    "request-promise": "^4.2.4"
  }
```

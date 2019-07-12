# ARTIC
#### 당신이 찾는 모든 지식 콘텐츠, 아틱(artic)

![앱아이콘](https://github.com/artic-development/artic_server/blob/master/images/logo.png)

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
   

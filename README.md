# ARTIC
#### 당신이 찾는 모든 지식 콘텐츠, 아틱(artic)

![앱아이콘](https://github.com/artic-development/artic_server/blob/master/images/logo.png)

* 2019 SOPT 24기 해커톤
    *  프로젝트 기간 : 2019년 7월 1일 ~ 2019년 7월 12일
* API - (https://github.com/artic-development/artic_server/wiki)
* 논리적 DB 모델링

![ERD](https://github.com/artic-development/artic_server/blob/master/images/ERD.png)


## 프로젝트 설명
* 어플의 소스코드가 하나의 프로젝트로 구성되어있으며 단일한 패티지로 배포되는 **모놀리틱 아키텍쳐**로 설계하였습니다.
* 보안적인 부분에서는 jwt토큰 기반 인증을 구현하였습니다. 
    * jwt토큰에 간단한 유저 정보를 넣어서 DB에 접근하는 횟수를 줄였습니다. 
    
* 데이터 베이스는 **몽고DB**와 **마리아 DB**를 사용하였습니다. 
    * 가수와 콘서트 그리고 장르 이렇게 3개의 컬렉션들의 데이터들은 쌓아놓고 삭제가 없을 뿐더러 READ가 빈번하기 때문에 NoSQL이 적합하다고 생각했습니다. 
    * 사용하기 쉽고, 리소스를 많이 요구하는 애플리케이션에 맞춰 확장할 수 있는 몽고 DB를 선택하였습니다.
 
*  지금은 작은 서비스이지만 운영 시스템의 중요도, 리스크 등을 감안하고 서버의 안정성을 생각해서 개발서버와 운영서버 두개를 운영하였습니다.
    * 개발 서버에서 거의 모든 환경이 운영과 같이 맞추어져 있어서 확인 후 운영쪽에 적용하였습니다.


## Architecture
![Architecture](https://github.com/artic-development/artic_server/blob/master/images/architecture.png)


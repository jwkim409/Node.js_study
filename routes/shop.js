// express 라이브러리의 router()라는 함수 쓸게요
// require 다른 파일이나 라이브러리 첨부할게요
var router = require('express').Router();


// 로그인 한 사람만 접속하게 하고 싶어 -> 미들웨어 쓰고 싶어
// -> 중간에 로그인했니(미들웨어) 적으면 됨
// 미들웨어 - 로그인 했는지 검사
 function 로그인했니(요청, 응답, next){
    if(요청.user){
       next()
    } else{
       응답.send('로그인 안 하셨네요')
    }
 }

 // 특정 라우터 파일에 미들웨어 적용하고 싶으면
 // 밑에 있는 모든 url에 적용할 미들웨어
 router.use(로그인했니);

 // 특정 url에만 적용하는 미들웨어
    //  router.use('/shirts', 로그인했니);


router.get('/shirts', function(요청, 응답){
    응답.send('셔츠 파는 페이지입니다.');
 });
 
 router.get('/pants', function(요청, 응답){
    응답.send('바지 파는 페이지입니다.');
 });

 // 라우터 끝내면
 //  module.exports = 내보낼 변수명
 module.exports = router

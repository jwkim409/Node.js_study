var router = require('express').Router();

router.get('/sports', function(요청, 응답){
    응답.send('스포츠 게시판');
 });
 
 router.get('/game', function(요청, 응답){
    응답.send('게임 게시판');
 });

 // 라우터 끝내면
 //  module.exports = 내보낼 변수명
 module.exports = router
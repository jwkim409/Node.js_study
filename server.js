// [서버 오픈 문법] (express 라이브러리 첨부, 사용)
const express = require('express');
const app = express();

// bodyparser 라이브러리
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 

// 몽고DB  (jwkim409  qwerty123)
const MongoClient = require('mongodb').MongoClient;

// EJS
app.set('view engine', 'ejs');


var db;  //  변수 하나 필요
MongoClient.connect('mongodb+srv://jwkim409:qwerty123@cluster0.bihqwt6.mongodb.net/todoapp?retryWrites=true&w=majority', function(에러, client){
   //연결되면 할 일
   if (에러) return console.log(에러);

   db = client.db('todoapp');  // todoapp이라는 database(폴더)에 연결좀요

   db.collection('post').insertOne( {이름 : 'Kim', 나이 : 22, _id : 01}, function(에러, 결과){
      console.log('저장완료');
   });
 })
 
 

app.listen(8080, function(){  
   console.log('listening on 8080')
});

app.get('/pet', function(요청, 응답){
   응답.send('펫용품 할 수 있는 페이지입니다.');
});

app.get('/beauty', function(요청, 응답){
   응답.send('뷰티용품 할 수 있는 페이지입니다.');
});

app.get('/', function(요청, 응답) { 
   응답.sendFile(__dirname +'/index.html')
 });

 app.get('/write', function(요청, 응답) { 
   응답.sendFile(__dirname +'/write.html')
 });


// 어떤 시림이 /add라는 경로로 post 요청을 하면
// 데이터 2개(날짜, 제목)를 보내주는데,
// 이때 post라는 이름을 가진 collection에 데이터 두 개 저장하기

app.post('/add', function(요청, 응답){
   응답.send('전송완료');
   console.log(요청.body.title);
   console.log(요청.body.date);
   db.collection('post').insertOne({ 제목 : 요청.body.title, 날짜 : 요청.body.date}, function(에러, 결과){
      console.log('저장완료');
   });
})

// /list로 get 요청으로 접속하면
// 실제 db에 저장된 데이터들로 예쁘게 꾸며진 html 보여줌

app.get('/list', function(요청, 응답){

   db.collection('post').find().toArray(function(에러, 결과){    // 모든 데이터 가져오기 문법
      console.log(결과);
      응답.render('list.ejs', { posts : 결과 });  // 찾은 결 ejs 파일에 집어넣어주세요
   });

   
});




// [서버 오픈 문법] (express 라이브러리 첨부, 사용)
const express = require('express');
const app = express();

// bodyparser 라이브러리
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 

// 몽고DB  (jwkim409  qwerty123)
const MongoClient = require('mongodb').MongoClient;

// method-override 라이브러리
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

// EJS
app.set('view engine', 'ejs');

// static 파일을 보관하기 위해 public 폴더를 쓸 거임
app.use('/public', express.static('public'));



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
   응답.render('index.ejs');
 });

 app.get('/write', function(요청, 응답) { 
   응답.render('write.ejs');
 });


app.post('/add', function(요청, 응답){
   db.collection('counter').findOne({ name : '게시물갯수'}, function(에러, 결과){
      var 총게시물갯수 = 결과.totalPost;
   
   db.collection('post').insertOne({ _id : 총게시물갯수 + 1, 제목 : 요청.body.title, 날짜 : 요청.body.date }, function(에러, 결과){
      console.log('저장완료');

   db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalPost:1} }, function(에러, 결과){
      if(에러){return console.log(에러)}
      응답.send('전송완료');
   })
   })
   })
})

app.get('/list', function(요청, 응답){

   db.collection('post').find().toArray(function(에러, 결과){    // 모든 데이터 가져오기 문법
      console.log(결과);
      응답.render('list.ejs', { posts : 결과 });  // 찾은 결 ejs 파일에 집어넣어주세요
   });
});

app.delete('/delete', function(요청, 응답){
   console.log(요청.body)
   요청.body._id = parseInt(요청.body._id);
   // 요청.body에 담긴 게시물 번호에 따라 DB에서 게시물 삭제
   db.collection('post').deleteOne(요청.body, function(에러, 결과){
      console.log('삭제완료');
      응답.status(200).send({ message : '성공했습니다'});
   })
})


// 게시물마다 상세페이지 만들기
app.get('/detail/:id', function(요청, 응답){  // 여기서 :id는 url의 파라미터
   db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){  // 파라미터 중 :id라는 뜻
      console.log(결과)
      응답.render('detail.ejs', { data : 결과 })  // 결과 = DB에서 찾은 게시물
   })
})


// 수정  /edit/1로 접속하면 1번 게시물 제목, 날짜를 edit.ejs로 보냄
app.get('/edit/:id', function(요청, 응답){
   db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러, 결과){
      if(결과 === null){응답.status(404).send('존재하지 않는 페이지입니다.')}
      응답.render('edit.ejs', { post : 결과 }) // 이 데이터를 post라는 이름으로 이용할 수 있음
   })
})

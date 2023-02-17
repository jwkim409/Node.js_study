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

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

// 환경변수 사용을 위한 라이브러리
require('dotenv').config()

// EJS
app.set('view engine', 'ejs');

// static 파일을 보관하기 위해 public 폴더를 쓸 거임
app.use('/public', express.static('public'));


// 환경변수
var db;
  MongoClient.connect(process.env.DB_URL, function(err, client){
  if (err) return console.log(err)
  db = client.db('todoapp');
//   db.collection('post').insertOne( {이름 : 'Kim', 나이 : 22, _id : 20}, function(에러, 결과){
//    console.log('저장완료');
// })
}) 

// var db;  //  변수 하나 필요
// MongoClient.connect('mongodb+srv://jwkim409:qwerty123@cluster0.bihqwt6.mongodb.net/todoapp?retryWrites=true&w=majority', function(에러, client){
//    //연결되면 할 일
//    if (에러) return console.log(에러);

//    db = client.db('todoapp');  // todoapp이라는 database(폴더)에 연결좀요

 
 

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


app.get('/list', function(요청, 응답){

   db.collection('post').find().toArray(function(에러, 결과){    // 모든 데이터 가져오기 문법
      console.log(결과);
      응답.render('list.ejs', { posts : 결과 });  // 찾은 결 ejs 파일에 집어넣어주세요
   });
});


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

// 누가 /edit 경로로 put 요청 함. form에 담긴 제목, 날짜 데이터 가지고  db.collection에 업데이트 함.
app.put('/edit', function(요청, 응답){
   db.collection('post').updateOne({ _id : parseInt(요청.body.id) }, { $set : { 제목 : 요청.body.title, 날짜 : 요청.body.date}}, function(에러, 결과){
      console.log('수정완료')
      응답.redirect('/list')
   })
});


// 로그인 페이지
app.get('/login', function(요청, 응답){
  응답.render('login.ejs') 
});

// 로그인을 하면.. 아이디 비번 검사
app.post('/login', passport.authenticate('local', {
   failureRedirect : '/fail'  // 실패하면 이 경로로 보내주세요
}), function(요청, 응답){
   응답.redirect('/')  // 성공하면 어떤 사람을 이 경로로 보내주세요~
});

// 미들웨어 쓰는 법 (마이페이지)
app.get('/mypage', 로그인했니, function (요청, 응답) {
   console.log(요청.user);   // 마이페이지 접속할 때마다 유저 데이터 뜸
   응답.render('mypage.ejs', { 사용자: 요청.user })
 }) 

// 미들웨어 만드는 법 (마이페이지 접속 전 실행할 미들웨어)
function 로그인했니(요청, 응답, next){
   if(요청.user){
      next()   // next() 통과
   } else{
      응답.send('로그인 안 하셨네요')
   }
}


// 로컬스트레티지 방법(복붙)
passport.use(new LocalStrategy({
   usernameField: 'id',
   passwordField: 'pw',
   session: true,
   passReqToCallback: false,
 }, function (입력한아이디, 입력한비번, done) {
   //console.log(입력한아이디, 입력한비번);
   db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
     if (에러) return done(에러)
     if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })  // DB에 아이디가 없으면 이거 실행
     if (입력한비번 == 결과.pw) {
       return done(null, 결과)
     } else {
       return done(null, false, { message: '비번틀렸어요' })
     }
   })
 }));
// 152줄 -> done(서버에러, 성공사용자DB데이터, 에러메시지)


// 로그인 성공 -> 세션정보 만듦 -> 마이페이지 방문 시 세션검사
// 세션 저장시키는 코드
passport.serializeUser(function (user, done) {
   done(null, user._id)
 });
 
 passport.deserializeUser(function (아이디, done) {  // 위에있는 user.id = 아이디
   db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
     done(null, {결과})
   })
 }); 


// 회원기능 필요하면 passport 셋팅 부분이 위에 있어야 함
// 회원가입
app.post('/register', function(요청, 응답){
   db.collection('login').insertOne( {id : 요청.body.id, pw : 요청.body.pw}, function(에러, 결과){
      응답.redirect('/')
   }) 
});


 // 회원기능 개발하던 곳에 있어야 함(안 그럼 _id를 못 찾는다고 에러 남)
 // /add로 요청처리(글업로드)할 때  작성자도 추가하자(요청.user : 현재 로그인한 사람의 정보가 들어있음)
 app.post('/add', 로그인했니,function(요청, 응답){
   db.collection('counter').findOne({ name : '게시물갯수'}, function(에러, 결과){
      
      var 총게시물갯수 = 결과.totalPost;
   
      var 저장할거 = { _id : 총게시물갯수 + 1, 작성자 : 요청.user._id, 제목 : 요청.body.title, 날짜 : 요청.body.date }

   db.collection('post').insertOne(저장할거, function(에러, 결과){
   // counter라는 콜렉션에 있는 totalpost 항목도 1 증가시켜야 함(수정)
   db.collection('counter').updateOne({name : '게시물갯수'}, { $inc : {totalPost:1} }, function(에러, 결과){
      if(에러){return console.log(에러)}
      응답.send('전송완료');
   })
   })
   })
})


app.delete('/delete', function(요청, 응답){
   console.log(요청.body)
   요청.body._id = parseInt(요청.body._id);

// 실제 로그인 중인 유저의 _id와 글에 저장된 유저의 _id가 일치하면 삭제해줘
   var 삭제할데이터 = { _id : 요청.body._id, 작성자 : 요청.user._id }

   // 요청.body에 담긴 게시물 번호에 따라 DB에서 게시물 삭제
   db.collection('post').deleteOne(삭제할데이터, function(에러, 결과){
      console.log('삭제완료');
      if(에러){console.log(에러)}
      응답.status(200).send({ message : '성공했습니다'});
   })
});


// 서버에서 query string 꺼내는 법
app.get('/search', (요청, 응답) => {
   var 검색조건 = [
      {
        $search: {
          index: 'titleSearch',  // 내가 만든 인덱스명
          text: {
            query: 요청.query.value,  // 검색어 입력하는 항목
            path: '제목'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
          }
        }
      },
      { $sort : { _id : 1 }}  // aggreate는 검색조건들 줄 수 있음.
    ] 
   db.collection('post').aggregate(검색조건).toArray((에러, 결과)=>{
      console.log(결과)  // 결과 잘 출력해줌
      응답.render('search.ejs', {posts : 결과})  // post라는 이름으로 결과 보내기
   })
})
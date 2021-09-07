const express = require('express')
const session = require('express-session') // 세션 관리를 위한 express-session
const morgan = require('morgan') // 작업 수행 시 로깅
const cors = require('cors') // CORS 에러 방지
const cookieParser = require('cookie-parser') // 쿠키 파싱 미들웨어
const dotenv = require('dotenv') // .env SECRET 정보 가져오기

// passportConfig - passport 내부 js 실행 (use, serialize, deserialze)
const passportConfig = require('./passport')
const passport = require('passport') // passport 미들웨어 가져오기

// dotenv 실행
// dotenv를 통해 SECRET KEY를 받는 코드보다 위에 위치해야한다.
dotenv.config()

const app = express()

// 제작한 모델 불러오기
const { sequelize } = require('./models/index')
// 라우터 불러오기
const pageRouter = require('./routes/page')
// const userRouter = require('./routes/user')

sequelize
  .sync({ force: false }) // 이 코드 발견 시 시퀄라이즈 실행
  .then(() => {
    console.log('데이터베이스 연결 성공')
  })
  .catch((err) => {
    console.error(err)
  })

passportConfig()
app.set('port', process.env.PORT || 3051) // 포트 설정
app.use(morgan('dev')) // 개발모드로 로깅
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: 'http://localhost:3000', // 단 아래 속성 true일 경우는 주소로 적어야한다.(보안강화)
    credentials: true, // front, back 간 쿠키 공유
  })
)
// cookieParser 설정에 비밀키를 넣어주자.
// cookieParser를 사용하게되면 req.cookies로 접근이 가능하다.
app.use(cookieParser(process.env.COOKIE_SECRET))
// session 설정
app.use(
  session({
    resave: false, // false 고정
    saveUninitialized: false, // false 고정
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true, // 항상 true(자바스크립트로 진입 불가 - XXS 공격 방지)
    },
    // name의 기본값 - connect_sid
  })
)
// 아래 2개는 session 아래로 적어주자
app.use(passport.initialize()) // passport 초기화 미들웨어
app.use(passport.session()) // 앱에서 영구 로그인을 사용한다면 추가하자

// router
app.use('/', pageRouter) // /
// app.use('/user', userRouter) // /user

// 404 처리 미들웨어
app.use((req, res, next) => {
  console.log('404 에러')
  res.status(404).send('Not Found')
})

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).send(err.message)
})

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트애서 대기중')
})

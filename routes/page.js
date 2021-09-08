const express = require('express') // express 가져오기
const { User } = require('../models') // User 가져오기
const bcrypt = require('bcrypt') // 비밀번로 해쉬화에 필요한 라이브러리
const passport = require('passport')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router() // express에서 제공하는 Router 미들웨어

// GET /
router.get('/', (req, res) => {
  res.send('until-api')
})

//회원가입
// POST /signup
router.post('/signup', isNotLoggedIn, async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body
    if (!email || !password || !nickname) {
      return res.status(403).json('모든 필드를 입력해야 합니다.')
    }
    const exEmail = await User.findAll({
      // 이메일 검사
      where: {
        // where : DB에서 조건을 건다.
        email: req.body.email,
      },
    })
    console.log(exEmail)
    const exNickname = await User.findAll({
      // 닉네임 검사
      where: {
        nick: req.body.nickname,
      },
    })
    if (exEmail.length > 0) {
      // 이메일 검사 후 이메일이 기존에 있다면?
      //return으로 res(응답)을 한번만 보내도록 한다. 응답 후 router 종료된다.
      return res.status(403).json('이미 사용중인 이메일입니다.')
    }
    if (exNickname.length > 0) {
      // 닉네임 검사 후 닉네임이 기존에 있다면?
      //return으로 res(응답)을 한번만 보내도록 한다. 응답 후 router 종료된다.
      return res.status(403).json('이미 사용중인 닉네임입니다.')
    }
    //bcrypt - 비밀번호 해쉬화 하기
    const hashedPassword = await bcrypt.hash(req.body.password, 12)
    // User 테이블에 신규 유저 생성하기
    await User.create({
      nick: req.body.nickname,
      email: req.body.email,
      password: hashedPassword,
    })
    // 요청에 대한 성공으로 status(201) : 생성 됐다는 의미 (기재하는게 좋다.)
    res.status(201).json('성공')
  } catch (error) {
    console.log(error)
    next(error) // status(500) - 서버에러
  }
})

// 로그인
// 미들웨어 확장법 (req, res, next를 사용하기 위해서)
// passport index.js에서 전달되는 done의 세가지 인자를 받는다.
router.post('/signin', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (serverError, user, clientError) => {
    // 여기서 local를 실행한다.
    if (serverError) {
      // 서버 에러
      console.log('서버 에러')
      console.log(serverError)
      return next(serverError)
    }
    if (clientError) {
      // 클라이언트 에러 (비밀번호가 틀렸거나, 계정이 없거나), info.reason에 에러 내용이 있음.
      console.log('클라이언트 에러')
      console.log(clientError.message)
      return next({ status: 403, message: clientError.message })
    }
    // 아래는 마지막으로 에러를 검사하는 코드다.
    // 성공하면 passport의 serialize가 실행된다.
    return req.login(user, async (loginError) => {
      if (loginError) {
        console.error('로그인 에러')
        console.error(loginError)
        return next(loginError)
      }
      // 비밀번호를 제외한 모든 정보 가져오기
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password'], // exclude: 제외한 나머지 정보 가져오기
        },
      })
      // 비밀번호를 제외한 유저 정보를 json으로 응답
      return res.status(200).json(fullUserWithoutPassword)
    })
  })(req, res, next) // 미들웨어 확장에서는 끝에 항상 넣어줘야한다.
})

// 로그아웃
// POST /logout/
router.post('/signout', isLoggedIn, (req, res) => {
  req.logOut()
  req.session.destroy()
  res.send('로그아웃')
})

module.exports = router

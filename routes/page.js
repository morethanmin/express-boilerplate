const express = require('express') // express 가져오기
const { User } = require('../models') // User 가져오기
const bcrypt = require('bcrypt') // 비밀번로 해쉬화에 필요한 라이브러리
const passport = require('passport')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

const router = express.Router() // express에서 제공하는 Router 미들웨어

// GET /
router.get('/', (req, res) => {
  res.send('hello~ express')
})

//회원가입
// POST /signup
router.post('/signup', isNotLoggedIn, async (req, res, next) => {
  try {
    const exEmail = await User.findAll({
      // 이메일 검사
      where: {
        // where : DB에서 조건을 건다.
        email: req.body.email,
      },
    })
    const exNickname = await User.findAll({
      // 닉네임 검사
      where: {
        nick: req.body.nickname,
      },
    })
    if (exEmail) {
      // 이메일 검사 후 이메일이 기존에 있다면?
      //return으로 res(응답)을 한번만 보내도록 한다. 응답 후 router 종료된다.
      return res.status(403).send('이미 사용중인 이메일입니다.')
    }
    if (exNickname) {
      // 닉네임 검사 후 닉네임이 기존에 있다면?
      //return으로 res(응답)을 한번만 보내도록 한다. 응답 후 router 종료된다.
      return res.status(403).send('이미 사용중인 닉네임입니다.')
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
    res.status(201).send('성공')
  } catch (error) {
    console.log(error)
    next(error) // status(500) - 서버에러
  }
})

// 로그인
// 미들웨어 확장법 (req, res, next를 사용하기 위해서)
// passport index.js에서 전달되는 done의 세가지 인자를 받는다.
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    // 여기서 local를 실행한다.
    if (err) {
      // 서버 에러
      console.error(err)
      return next(err)
    }
    if (info) {
      // 클라이언트 에러 (비밀번호가 틀렸거나, 계정이 없거나), info.reason에 에러 내용이 있음.
      res.status(403).send(info.reason)
    }
    // 아래는 마지막으로 에러를 검사하는 코드다.
    // 성공하면 passport의 serialize가 실행된다.
    return req.login(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr)
        return next(loginErr)
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
router.post('/logout', isLoggedIn, (req, res) => {
  req.logOut()
  req.session.destroy()
  res.send('로그아웃')
})

module.exports = router

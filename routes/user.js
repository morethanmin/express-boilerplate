const express = require('express')
const router = express.Router()
const { User } = require('../models')
const { isLoggedIn, isNotLoggedIn } = require('./middlewares')

// 로그인 사용자 정보 가져오기 (계속 로그인 상태를 만들기 위한)
// GET /user
// isLoggedIn 발견되면 인증 체크 후 다음 미들웨어를 실행시킨다.
router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    // 로그인 인증이 되었다면, req.user에서 유저 정보 확인 가능
    if (req.user) {
      // 로그인 인증된 유저의 id 가져오기
      const user = await User.findOne({
        where: { id: req.user.id },
      })
      // 그 유저의 정보 중 비밀번호를 제외한 정보 가져오기
      const fullUserWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: {
          exclude: ['password'], // exclude: 제외한 나머지 정보 가져오기
        },
      })
      res.status(200).json(fullUserWithoutPassword)
    } else {
      res.status(200).json(null)
    }
  } catch (error) {
    console.error(error)
    next(error)
  }
})

module.exports = router

// 인증이 되어있는가? true
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.status(401).json('로그인이 필요합니다.')
  }
}

// 인증이 되지 않았는가? false
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next()
  } else {
    res.status(401).json('로그아웃 후 접근이 가능합니다.')
  }
}

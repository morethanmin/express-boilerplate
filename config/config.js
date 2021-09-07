const dotenv = require('dotenv')

// .env 파일의 DB_PASSWORD를 가져오기 위해
dotenv.config()

module.exports = {
  development: {
    // 개발모드
    username: 'root', // 사용자 이름
    password: process.env.DB_PASSWORD, // DB 비밀번호
    database: 'until_development', // DB 이름
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  test: {
    // 테스트
    username: 'root',
    password: process.env.DB_PASSWORD,
    database: 'until_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    // 배포용
    username: 'root',
    password: process.env.DB_PASSWORD,
    database: 'until_production',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
}

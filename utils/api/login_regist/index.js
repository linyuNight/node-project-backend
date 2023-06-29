const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { tokenKey } = require('../../../config/index.js')

const loginAndRegist = (app, db) => {
  // 登录
  const login = async (username, password) => {
    console.log(' 测试 username',username)
    console.log(' 测试 password',password)
    try {
      // 检查用户名是否已存在
      const user = await db.collection('users').findOne({ username });

      console.log(' 测试 user',user)

      if (user) {
        let isTrue = bcrypt.compareSync(password, user.password)
        if(isTrue) {
          return username
        } else {
          return false
        }
      } else {
        throw new Error('Username not exists');
      }
    } catch (error) {
      console.error('登录失败:', error.message);
    } finally {
      // 关闭数据库连接
      // client.close();
    }
  }

  // 注册
  const register = async (username, password) => {
    try {
      // 检查用户名是否已存在
      const existingUser = await db.collection('users').findOne({ username });

      if (existingUser) {
        // throw new Error('Username already exists');
        return false
      }

      // 使用 bcrypt 对密码进行哈希处理
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建新用户
      const newUser = { username, password: hashedPassword };
      const result = await db.collection('users').insertOne(newUser);

      // console.log('User registered successfully:', result.insertedId);
      return true
    } catch (error) {
      // console.error('Registration failed:', error.message);
      return false
    } finally {
      // 关闭数据库连接
      // client.close();
    }
  };

  // 登录
  app.post('/login', (req, res) => {
    console.log('req.body', req.body)
    login(req.body.username, req.body.password).then(data => {
      if(data) {
        let username = data
        const token = jwt.sign({
          user: {
            username: username
          }
        }, tokenKey, { expiresIn: "3h" });
        res.send({
          token: token
        })
      } else {
        res.send(false)
      }
      // res.send(data)
    })
  })

  // 注册
  app.post('/register', (req, res) => {
    console.log('测试post', req.body)
    register(req.body.username, req.body.password).then(data => {
      if(data) {
        res.send('success')
      } else {
        res.send('fail')
      }
    })  
  })
}

module.exports = {
  loginAndRegist
}
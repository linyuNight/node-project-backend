// var express = require('express');
const fs = require('fs');
var app = require('express')();
const cors = require('cors');

const bodyParser = require('body-parser');
const authMiddleware = require('./utils/middleware/authMiddleware');
const { upload } = require('./utils/api/upload/index.js')
const { loginAndRegist } = require('./utils/api/login_regist/index.js')
const { ioChat } = require('./utils/api/io_chat/index.js')

// var http = require('http').Server(app)

let isPro = process.env.NODE_ENV === 'pro'

// require('./mysql.js');
// require('./mongodb.js');

// 配置 SSL 证书和私钥的路径
const options = {
  cert: isPro ? fs.readFileSync('/etc/letsencrypt/live/bibibi.website/fullchain.pem'): '',
  key: isPro ? fs.readFileSync('/etc/letsencrypt/live/bibibi.website/privkey.pem'): '',
};

var http = isPro ? require('https').createServer(options, app) : require('http').Server(app) 

// post数据处理
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log('测试env', process.env.NODE_ENV)

// 客户端
// let clientUrl = 'https://bibibi.website'
let clientUrl = '*'

// 跨域
app.use(cors({
  origin: isPro ? clientUrl : "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的请求方法
  allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
  credentials: true // 允许携带认证信息（如 Cookies）
}));
// token验证中间件
app.use(authMiddleware);

// mongo数据库
const { MongoClient, ObjectId } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
client.connect();

const db = client.db('myProject');
// const collection = db.collection('documents');

// 上传
upload(isPro, app)

// 登录和注册
loginAndRegist(app, db)

// 聊天接口
ioChat(isPro, http, app, db)

// app.use(express.static('public'));

app.get('/aaa', (req, res) => {
  res.send('success123')
})

// 检查当前用户
app.get('/current_user', async (req, res) => {
  console.log('hahah', req.decoded.user)
  console.log('hahah', req.decoded.user.username)
  const currentUser = await db.collection('users').findOne({ username: req.decoded.user.username });
  if(currentUser) {
    console.log('测试匹配用户', currentUser._id)
    res.send({
      username: currentUser.username,
      id: currentUser._id
    })
  } else {
    res.send('没有匹配用户')
  }  
})

http.listen(3333, function() {
  console.log('listening on 3333')
})
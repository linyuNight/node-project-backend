var express = require('express');
const fs = require('fs');
var app = require('express')();
const cors = require('cors');
const path = require('path');

const bodyParser = require('body-parser');
const authMiddleware = require('./utils/middleware/authMiddleware');
const { uploadDeploy } = require('./server/api/upload_deploy/index.js')
const { cloudData } = require('./server/api/cloud_data/index.js')
const { music } = require('./server/api/music/index.js')
const { loginAndRegist } = require('./server/api/login_regist/index.js')
const { ioChat } = require('./server/api/io_chat/index.js')
const { clientUrl } = require('./config/index.js')

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
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
client.connect();

const db = client.db('myProject');
// const collection = db.collection('documents');

// 上传
uploadDeploy(isPro, app)

// 云数据
cloudData(isPro, app)

// 音乐
music(isPro, app)

// 登录和注册
loginAndRegist(app, db)

// 聊天接口
ioChat(isPro, http, app, db)

app.use('/music', express.static(path.join(__dirname, 'uploads/music')));

// 网络测试接口
app.get('/aaa', (req, res) => {
  res.send('success12345')
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
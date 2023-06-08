// var express = require('express');
var app = require('express')();
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
var http = require('http').Server(app)
// require('./mysql.js');
// require('./mongodb.js');

// post数据处理
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 跨域
app.use(cors());

const { Server } = require("socket.io");
const io = new Server(
  http, // 这个参数可以自定义，比如直接写 3002
  {
    cors: {
      // origin: "http://localhost:8080"
      "origin": "*",
      // "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      // "preflightContinue": false,
      // "optionsSuccessStatus": 204
    }
  }
);

let initialized = false; // 初始化标志

// 存储用户和对应的分组信息
// const users = [];

io.on('connection', (socket) => {
  if (!initialized) {
    console.log('测试io');

    // 执行初始化操作
    initialized = true;
  }

  socket.on('aaa', (res) => {
    console.log('测试sockert', res)

    io.emit("hi", "everyone");
  });

  // 处理用户加入分组请求
  socket.on('joinGroup', (group) => {
    if(group) {
      // users.push({
      //   id: socket.id,
      //   group: group
      // })
  
      socket.join(group);
    }
  });

  // 处理客户端发送的消息
  socket.on('message', (data) => {
    // let group = users.find(val => {
    //   return val.id == socket.id
    // }).group

    console.log('测试group', data.group)
    io.to(data.group).emit('message', data.message);
  });
});



// setTimeout(() => {
//   io.emit("hi", "everyone");
// }, 3000)



// app.use(express.static('public'));


// mongo数据库
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
client.connect();

const db = client.db('myProject');
const collection = db.collection('documents');

app.get('/aaa', (req, res) => {
  res.send('success123')
})

app.get('/test', (req, res) => {
  collection.insertOne({
    name: 'aaa'
  }).then(() => {
    collection.find({}).toArray().then(data => {
      console.log('测试mogo', data)

      res.send(data)
    })
  })
})


// 注册
const register = async (username, password) => {
  try {
    // 检查用户名是否已存在
    const existingUser = await db.collection('users').findOne({ username });

    if (existingUser) {
      throw new Error('Username already exists');
    }

    // 使用 bcrypt 对密码进行哈希处理
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = { username, password: hashedPassword };
    const result = await db.collection('users').insertOne(newUser);

    console.log('User registered successfully:', result.insertedId);
  } catch (error) {
    console.error('Registration failed:', error.message);
  } finally {
    // 关闭数据库连接
    // client.close();
  }
};

// 登录
const login = async (username, password) => {
  try {
    // 检查用户名是否已存在
    const user = await db.collection('users').findOne({ username });

    if (user) {
      return bcrypt.compareSync(password, user.password)
    } else {
      throw new Error('Username not exists');
    }
  } catch (error) {
    console.error('Registration failed:', error.message);
  } finally {
    // 关闭数据库连接
    // client.close();
  }
}

// 注册
app.post('/register', (req, res) => {
  console.log('测试post', req.body)
  register(req.body.username, req.body.password)
  res.send('success')
})

// 检查
app.get('/check', (req, res) => {
  db.collection('users').find({}).toArray().then(data => {
    res.send(data)
  })
})

// 登录
app.post('/login', (req, res) => {
  login(req.body.username, req.body.password).then(data => {
    res.send(data)
  })
})


// const MongoClient = require('mongodb').MongoClient;

// const url = 'mongodb://localhost:27017'; // MongoDB 的连接 URL
// const dbName = 'mydatabase'; // 数据库名称

// MongoClient.connect(url, function(err, client) {
//   if (err) {
//     console.log('连接到 MongoDB 失败:', err);
//     return;
//   }

//   console.log('成功连接到 MongoDB');

//   const db = client.db(dbName);
//   // 在这里执行 MongoDB 操作，例如插入、查询等等

//   client.close();
// });


// const { MongoClient } = require('mongodb');
// // or as an es module:
// // import { MongoClient } from 'mongodb'

// // Connection URL
// const url = 'mongodb://localhost:27017';
// const client = new MongoClient(url);
// client.connect();

// const db = client.db('myProject');
// const collection = db.collection('documents');




// Database Name
// const dbName = 'myProject';

// async function main() {
//   // Use connect method to connect to the server
//   await client.connect();
//   console.log('Connected successfully to server');
//   const db = client.db(dbName);
//   // const collection = db.collection('documents');

//   // the following code examples can be pasted here...

//   // const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
//   // console.log('Inserted documents =>', insertResult);

//   // const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
//   // console.log('Updated documents =>', updateResult);

//   // const deleteResult = await collection.deleteMany({ a: 3 });
//   // console.log('Deleted documents =>', deleteResult);

//   // const indexName = await collection.createIndex({ a: 1 });
//   // console.log('index name =', indexName);

//   // const findResult = await collection.find({}).toArray();
//   // console.log('Found documents =>', findResult);

//   // const filteredDocs = await collection.find({ a: 3 }).toArray();
//   // console.log('Found documents filtered by { a: 3 } =>', filteredDocs);

//   // db.aaaa.insertMany([
//   //   {
//   //     label: 'aaa',
//   //     text: 'bbb'
//   //   },
//   //   {
//   //     label: 'ccc'
//   //   }
//   // ])

//   // db.aaaa.find({})

//   const user = db.collection('user');

//   user.insertOne({
//     name: 'aaa'
//   })

//   user.find({})


//   return 'done.';
// }

// main()
//   .then(console.log)
//   .catch(console.error)
//   .finally(() => client.close());



http.listen(3001, function() {
  console.log('listening on 3001')
})
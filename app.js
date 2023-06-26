// var express = require('express');
const fs = require('fs');
var app = require('express')();
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const authMiddleware = require('./utils/authMiddleware');
const { tokenKey } = require('./config/index.js')
// var http = require('http').Server(app)

// require('./mysql.js');
// require('./mongodb.js');

// 配置 SSL 证书和私钥的路径
const options = {
  cert: fs.readFileSync('/etc/letsencrypt/live/bibibi.website/fullchain.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/bibibi.website/privkey.pem'),
};

var http = require('https').createServer(options, app)

// post数据处理
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log('测试env', process.env.NODE_ENV)

let isPro = process.env.NODE_ENV === 'pro'
// 客户端
let clientUrl = 'https://103.152.132.60:443'

// 跨域
app.use(cors({
  origin: isPro ? clientUrl : "*"
}));
app.use(authMiddleware);

const { Server } = require("socket.io");
const io = new Server(
  http, // 这个参数可以自定义，比如直接写 3002
  {
    cors: {
      origin: isPro ? clientUrl : "*"
      // "origin": "*",
      // "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      // "preflightContinue": false,
      // "optionsSuccessStatus": 204
    }
    // cors: true
  }
);

let initialized = false; // 初始化标志

// 存储用户和对应的分组信息
// const users = [];

io.use((socket, next) => {
  // 获取客户端传递的 token
  const token = socket.handshake.auth.token;

  console.log('io token 验证', token)

  // 验证 token
  jwt.verify(token, tokenKey, (err, decoded) => {
    if (err) {
      // 验证失败，拒绝连接
      return next(new Error('Invalid token'));
    }

    // 验证成功，将解码后的数据附加到 socket 对象上
    socket.decoded = decoded;
    next();
  });
});

// sokcket.io连接
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

  // 删除一条消息
  socket.on('delete_message', async (data) => {
    // let group = users.find(val => {
    //   return val.id == socket.id
    // }).group

    // db.collection('users').insertOne(newUser);
    console.log('测试data', data)
    try {
      // 检查用户名是否已存在
      const result = await db.collection('groups').updateOne(
        { 
          groupname: data.groupname
        },
        {
          $pull: {
            messages: {
              id: new ObjectId(data.id)
            }
          }
        }
      );

      console.log('插入message', result)
    } catch (error) {
      console.error('Registration failed:', error.message);
    } finally {
      // 关闭数据库连接
      // client.close();
    }

    console.log('测试message data', data)
    io.to(data.groupname).emit('delete_message', {
      id: data.id
    });
  });

  // 处理客户端发送的消息
  socket.on('message', async (data) => {
    // let group = users.find(val => {
    //   return val.id == socket.id
    // }).group

    // db.collection('users').insertOne(newUser);
    console.log('测试data', data)
    let id = new ObjectId()
    
    try {
      // 检查用户名是否已存在
      const result = await db.collection('groups').updateOne(
        { 
          groupname: data.groupname
        },
        {
          $push: {
            messages: {
              id: id,
              username: data.username,
              // 目前userid没多大用
              userid: data.userid,
              message: data.message
            }
          }
        }
      );

      console.log('插入message', result)
    } catch (error) {
      console.error('Registration failed:', error.message);
    } finally {
      // 关闭数据库连接
      // client.close();
    }

    console.log('测试message data', data)
    io.to(data.groupname).emit('message', {
      id: id,
      username: data.username,
      // 目前userid没多大用
      userid: data.userid,
      message: data.message
    });
  });
});



// setTimeout(() => {
//   io.emit("hi", "everyone");
// }, 3000)



// app.use(express.static('public'));


// mongo数据库
const { MongoClient, ObjectId } = require('mongodb');
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

// 创建群组
app.post('/create_group', async (req, res) => {
  console.log('测试req.body', req.body)
  try {
    // 检查用户名是否已存在
    const existingGroup = await db.collection('groups').findOne({ 
      groupname: req.body.groupname
    });

    console.log('测试existingGroup', existingGroup)
    if (existingGroup) {
      throw new Error('group already exists');
    }

    // 创建新群组
    const newGroup = { 
      groupname: req.body.groupname,
      creator: req.body.creator
    };

    console.log('测试newGroup', newGroup)
    const result = await db.collection('groups').insertOne(newGroup);

    console.log('测试newGroup successfully:', result.insertedId);
    res.send(true)
  } catch (error) {
    console.error('Registration failed:', error.message);
    res.send(false)
  } finally {
    // 关闭数据库连接
    // client.close();
  }
})

// 查询群信息
app.post('/query_group', async (req, res) => {
  console.log('测试req.body123123', req.body)
  try {
    // 检查组名是否已存在
    const existingGroup = await db.collection('groups').findOne({ 
      groupname: req.body.groupname
    });

    // console.log('测试群信息', existingGroup)
    if (existingGroup) {
      res.send(existingGroup)
    } else {
      res.send(false)
    }
  } catch (error) {
    console.error('Registration failed:', error.message);
    res.send(false)
  } finally {
    // 关闭数据库连接
    // client.close();
  }
})

// 删除一条群消息
// app.post('/delete_group_message', async (req, res) => {
//   console.log('测试req.body6666', req.body)
//   try {
//     // 检查组名是否已存在
//     const result = await db.collection('groups').updateOne(
//       { 
//         groupname: req.body.groupname
//       },
//       {
//         $pull: {
//           messages: {
//             id: new ObjectId(req.body.id)
//           }
//         }
//       }
//     );

//     // console.log('测试删除消息', result)
//     if (result) {
//       res.send(true)
//     } else {
//       res.send(false)
//     }
//   } catch (error) {
//     console.error('删除失败:', error.message);
//     res.send(false)
//   } finally {
//     // 关闭数据库连接
//     // client.close();
//   }
// })

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
const login = async (username, password) => {
  try {
    // 检查用户名是否已存在
    const user = await db.collection('users').findOne({ username });

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

// 查看所有用户
app.get('/query_all_users', (req, res) => {
  db.collection('users').find({}).toArray().then(data => {
    res.send(data)
  })
})

// 查看所有群
app.get('/query_all_groups', (req, res) => {
  db.collection('groups').find({}).toArray().then(data => {
    
    res.send(data)
  })
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

// 登录
app.post('/login', (req, res) => {
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



http.listen(3333, function() {
  console.log('listening on 3333')
})
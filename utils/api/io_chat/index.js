const jwt = require("jsonwebtoken");
const { tokenKey } = require('../../../config/index.js')
const { clientUrl } = require('./config/index.js')

const ioChat = (isPro, http, app, db) => {
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
}

module.exports = {
  ioChat
}

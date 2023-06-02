// var express = require('express');
var app = require('express')();
const cors = require('cors');
var http = require('http').Server(app)
// require('./mysql.js');
// require('./mongodb.js');

app.use(cors());
app.use(express.static('public'));



const { MongoClient } = require('mongodb');
// or as an es module:
// import { MongoClient } from 'mongodb'

// Connection URL
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
      // res.send(res)
    })

    // console.log(res)
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
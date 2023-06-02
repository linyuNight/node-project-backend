var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'secret',
  database : 'todos',
  charset: 'utf8mb4'
});

connection.query('SET NAMES utf8mb4');
 
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});
 
// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('The solution is: ', results[0].solution);
// });

// connection.query('SHOW TABLES', function (error, results, fields) {
//   if (error) throw error;
//   // console.log('The solution is: ', results[0].solution);
//   console.log('测试mysql results', results)
// });
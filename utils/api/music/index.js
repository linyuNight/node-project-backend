const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('ffff', req.body)

    const folderPath = path.join(__dirname, '../../../uploads/music');

    // 指定文件存储的目录
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    console.log('tttt', file)
    // 指定文件名
    cb(null, Buffer.from(file.originalname,"latin1").toString("utf8"));
  }
});

const uploadInstance = multer({ 
  storage: storage,
});

const music = (isPro, app) => {
  // 上传文件
  app.post('/upload_music', uploadInstance.single('file'), (req, res) => {
    res.send('文件上传成功');      
  });
  // 查询音乐列表
  app.get('/query_music', (req, res) => {  
    // console.log('测试req.query.path', Boolean(req.query.path))
    // const folderPath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}`, 'music');
    const folderPath = path.join(__dirname, '../../../uploads/music');
  
    console.log('测试folderPath', folderPath)
    // 检查文件夹是否存在
    if (!fs.existsSync(folderPath)) {
      // 创建文件夹
      fs.mkdirSync(folderPath);
      console.log('文件夹创建成功');
    } else {
      console.log('文件夹已存在');
    }

    // 读取文件夹中的所有文件
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read folder' });
      } else {
        let list = files.map(val => {
          const musicinfo = fs.statSync(path.join(folderPath, val));

          return {
            name: val,
            size: musicinfo.size
          }
        })

        // 返回文件名列表给前端
        res.json({ files: list });
      }
    });
  });

  // 播放音乐
  app.get('/music', (req, res) => {
    // console.log('测试参数', req.decoded)
    // if(req.query.userid !== req.decoded.user.userid) {
    //   return res.send('token校验失败')
    // }

    const filename = req.query.filename
    // 获取要下载的文件路径
    const audioFilePath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}`, req.query.path ? req.query.path : 0, filename);
    console.log('测试播放audioFilePath', audioFilePath)
    const stat = fs.statSync(audioFilePath);
    const fileSize = stat.size;
    console.log('测试req.headers', req.headers)

    const headers = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg', // 根据实际音频类型设置
    };

    res.writeHead(200, headers);
    fs.createReadStream(audioFilePath).pipe(res);
  });
}

module.exports = {
  music
}
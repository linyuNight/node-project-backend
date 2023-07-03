const multer = require('multer');
// const path = require('path');
const AdmZip = require('adm-zip');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('ffff', req.body.userid)

    const folderPath = path.join(__dirname, `../../../uploads/cloud_data/${req.body.userid}`);

    if (!fs.existsSync(folderPath)) {
      // 创建文件夹
      fs.mkdirSync(folderPath);
    }

    // 指定文件存储的目录
    cb(null, path.join(__dirname, `../../../uploads/cloud_data/${req.body.userid}/`));
  },
  filename: function (req, file, cb) {
    console.log('tttt', file)
    // 指定文件名
    cb(null, file.originalname);
  }
});

const uploadInstance = multer({ storage: storage });

const cloudData = (isPro, app) => {
  // 处理文件上传的路由
  app.post('/upload_clound_data', uploadInstance.single('file'), (req, res) => {
    res.send('文件上传成功');      
  });

  app.get('/query_clound_data', (req, res) => {    
    const folderPath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}`);
  
    // 读取文件夹中的所有文件
    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read folder' });
      } else {
        // 返回文件名列表给前端
        res.json({ files });
      }
    });
  });

  app.get('/download_clound_file', (req, res) => {
    console.log('测试参数', req.decoded)
    if(req.query.userid !== req.decoded.user.userid) {
      return res.send('token校验失败')
    }
    // console.log('测试decoded',req)
    // return res.send(123)
    // 获取要下载的文件路径
    const filePath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}/${req.query.filename}`);
  
    // 设置响应头，指定文件类型和下载的文件名
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${req.query.filename}"`); // 替换为要下载的文件名
  
    // // 发送文件给客户端
    // res.sendFile(filePath);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
}

module.exports = {
  cloudData
}
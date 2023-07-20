const fs = require('fs');
const path = require('path');

const music = (isPro, app) => {
  // 查询音乐列表
  app.get('/query_music', (req, res) => {  
    // console.log('测试req.query.path', Boolean(req.query.path))
    const folderPath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}`, 'music');
  
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
        // 返回文件名列表给前端
        res.json({ files });
      }
    });
  });

  // 获取音乐
  app.get('/music', (req, res) => {
    console.log('测试参数', req.decoded)
    if(req.query.userid !== req.decoded.user.userid) {
      return res.send('token校验失败')
    }

    const filename = req.query.filename
    // 获取要下载的文件路径
    const filePath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}`, req.query.path ? req.query.path : 0, filename);
    console.log('测试播放filePath', filePath)

    res.setHeader('Content-Type', 'video/mp4');

    const videoStream = fs.createReadStream(filePath);
    videoStream.pipe(res);
  });
}

module.exports = {
  music
}
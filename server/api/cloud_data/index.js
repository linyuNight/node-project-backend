const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('ffff', req.body)

    const folderPath = path.join(__dirname, `../../../uploads/cloud_data/${req.body.userid}`, req.body.path ? req.body.path : '');

    if (!fs.existsSync(folderPath)) {
      // 创建文件夹
      fs.mkdirSync(folderPath);
    }

    // 指定文件存储的目录
    cb(null, path.join(__dirname, `../../../uploads/cloud_data/${req.body.userid}/`, req.body.path ? req.body.path : ''));
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


// 文件类型与 MIME 类型的映射关系
const mimeTypes = {
  'txt': 'text/plain',
  'html': 'text/html',
  'css': 'text/css',
  'js': 'application/javascript',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'bmp': 'image/bmp',
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'ogg': 'audio/ogg',
  'mp4': 'video/mp4',
  'avi': 'video/x-msvideo',
  'mkv': 'video/x-matroska',
  'zip': 'application/zip',
  'tar': 'application/x-tar',
  'gz': 'application/gzip',
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/msword',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.ms-excel',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.ms-powerpoint',
};

// 获取文件扩展名
function getFileExtension(filename) {
  // return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  let tempList = filename.split('.')
  return tempList[tempList.length - 1];
}

// 根据文件扩展名获取对应的 MIME 类型
function getMimeType(filename) {
  const ext = getFileExtension(filename);
  console.log('测试ext', ext)
  return mimeTypes[ext] || 'application/octet-stream';
}

// 设置文件下载的 Content-Type
function setFileContentType(filename, res) {
  const mimeType = getMimeType(filename);
  res.setHeader('Content-Type', mimeType);
}


const cloudData = (isPro, app) => {
  // 创建文件夹
  app.post('/create_clound_data_folder', (req, res) => {
    console.log(req.body.folderPath)

    const folderPath = path.join(__dirname, `../../../uploads/cloud_data/${req.decoded.user.userid}`, req.body.folderPath);
    
    // 检查文件夹是否存在
    if (!fs.existsSync(folderPath)) {
      // 创建文件夹
      fs.mkdirSync(folderPath);
      res.send('文件夹创建成功');
    } else {
      res.send('文件夹已存在');
    }
  })

  // 上传文件
  app.post('/upload_clound_data', uploadInstance.single('file'), (req, res) => {
    res.send('文件上传成功');      
  });

  // 查询已经上传的文件列表
  app.get('/query_clound_data', (req, res) => {  
    // console.log('测试req.query.path', Boolean(req.query.path))
    const folderPath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}`, req.query.path ? req.query.path : '');
  
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
          const isFile = fs.statSync(path.join(folderPath, val)).isFile();

          return {
            name: val,
            isFile: isFile == true ? 1 : 0
          }
        })

        // 返回文件名列表给前端
        res.json({ files: list });
      }
    });
  });

  // 下载文件
  app.get('/download_clound_file', (req, res) => {
    console.log('测试参数', req.decoded)
    if(req.query.userid !== req.decoded.user.userid) {
      return res.send('token校验失败')
    }

    const filename = req.query.filename
    console.log('测试req.query 123',req.query)
    // return res.send(123)
    // 获取要下载的文件路径
    const filePath = path.join(__dirname, `../../../uploads/cloud_data`, req.query.userid, req.query.path ? req.query.path : '', filename);
    console.log('测试filePath',filePath)

    // 设置响应头，指定文件类型和下载的文件名
    // res.setHeader('Content-Type', 'application/octet-stream');
    setFileContentType(filename, res)
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`); // 替换为要下载的文件名
    res.setHeader('Content-Encoding', 'UTF-8');

    // // 发送文件给客户端
    // res.sendFile(filePath);  

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });

  // 获取视频
  app.get('/video', (req, res) => {
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

  // const WebTorrent = require('webtorrent')

  // const client = new WebTorrent()

  // const magnetURI = 'magnet:?xt=urn:btih:af9d86e8786ca73e714a4b50a6d258daabc243dd'

  // const folderPath = path.join(__dirname, `../../../uploads`);

  // client.add(magnetURI, { path: folderPath }, function (torrent) {
  //   torrent.on('done', function () {
  //     console.log('torrent download finished')
  //   })
  // })

  // 删除文件或文件夹
  app.delete('/delete_cloud_file', (req, res) => {    
    const unlinkPath = path.join(__dirname, `../../../uploads/cloud_data`, req.decoded.user.userid, req.body.path, req.body.file)
    if (req.body.isFile) {
      fs.unlink(unlinkPath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          res.status(500).send('Error deleting file');
        } else {
          console.log('File deleted successfully');
          res.send('File deleted successfully');
        }
      });
    } else {
      fs.rmdir(unlinkPath, { recursive: true }, (err) => {
        if (err) {
          console.error('Error deleting folder:', err);
          res.status(500).send('Error deleting folder');
        } else {
          console.log('Folder deleted successfully');
          res.send('Folder deleted successfully');
        }
      });
    }    
  })

  // 磁力下载到后台
  app.post('/magnet_link_download', (req, res) => {
    import('webtorrent-hybrid').then(({ default: WebTorrent }) => {
      // console.log('测试WebTorrent', WebTorrent)

      const magnetLink = req.body.link;
      const client = new WebTorrent();

      console.log('测试magnetLink', magnetLink)
  
      const folderPath = path.join(__dirname, `../../../uploads/cloud_data/${req.decoded.user.userid}`);
      client.add(magnetLink, { path: folderPath }, torrent => {
        console.log('测试torrent', torrent)

        // 监听下载进度
        torrent.on('download', (bytesDownloaded, bytesRemaining) => {
          const progress = (bytesDownloaded / torrent.length * 100).toFixed(2);
          console.log('Progress: ' + progress + '%');
        });
        
        // 下载完成后的处理
        torrent.on('done', () => {
          console.log('Download completed');
          client.destroy(); // 关闭 WebTorrent 客户端
          res.send('File downloaded successfully');
        });
      });
    });
  })
}

module.exports = {
  cloudData
}
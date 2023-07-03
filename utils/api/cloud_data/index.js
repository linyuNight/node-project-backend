const multer = require('multer');
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
  // 处理文件上传的路由
  app.post('/upload_clound_data', uploadInstance.single('file'), (req, res) => {
    res.send('文件上传成功');      
  });

  app.get('/query_clound_data', (req, res) => {    
    const folderPath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}`);
  
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
          // const isFile = fs.statSync(path.join(folderPath, val)).isFile();

          return {
            name: val
            // isFile: isFile
          }
        })

        // 返回文件名列表给前端
        res.json({ files: list });
      }
    });
  });

  app.get('/download_clound_file', (req, res) => {
    console.log('测试参数', req.decoded)
    if(req.query.userid !== req.decoded.user.userid) {
      return res.send('token校验失败')
    }

    const filename = req.query.filename
    // console.log('测试decoded',req)
    // return res.send(123)
    // 获取要下载的文件路径
    const filePath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}/${filename}`);
  
    // 设置响应头，指定文件类型和下载的文件名
    // res.setHeader('Content-Type', 'application/octet-stream');
    setFileContentType(filename, res)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`); // 替换为要下载的文件名
  
    // // 发送文件给客户端
    // res.sendFile(filePath);  

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });

  app.get('/video', (req, res) => {
    console.log('测试参数', req.decoded)
    if(req.query.userid !== req.decoded.user.userid) {
      return res.send('token校验失败')
    }

    const filename = req.query.filename
    // 获取要下载的文件路径
    const filePath = path.join(__dirname, `../../../uploads/cloud_data/${req.query.userid}/${filename}`);
  
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
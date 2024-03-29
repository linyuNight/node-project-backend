const multer = require('multer');
const AdmZip = require('adm-zip');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // 指定文件保存的目录
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     // 生成文件名
//     const ext = path.extname(file.originalname);
//     const filename = `${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
//     cb(null, filename);
//   }
// });

// 创建 multer 实例
// const uploadInstance = multer({ storage });
const uploadInstance = multer({ dest: 'uploads/' });

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = path + '/' + file;

      if (fs.lstatSync(curPath).isDirectory()) {
        // 递归删除子文件夹
        deleteFolderRecursive(curPath);
      } else {
        // 删除文件
        fs.unlinkSync(curPath);
      }
    });

    // 删除空文件夹
    fs.rmdirSync(path);
  }
}

const uploadDeploy = (isPro, app) => {
  // 处理pc文件上传的路由
  app.post('/upload', uploadInstance.single('file'), (req, res) => {
    try {
      const file = req.file
      console.log('上传文件信息', file)

      console.log('测试zzzzisPro1', isPro)

      // const uploadFolder = isPro ? '/usr/share/nginx/html/node-project' : '../../../uploads/extracted'
      // const uploadFolder = '../../../uploads/extracted'
      // const uploadFolder = '/Users/laurent.lin/Desktop/linyu/learn/node/node-project-frontend/dist'

      // 解压后的目标路径
      // const targetPath = path.join(__dirname, uploadFolder);
      const targetPath = isPro ? '/usr/share/nginx/html/node-project' : '/Users/laurent.lin/Desktop/linyu/learn/node/node-project-frontend/dist'

      console.log('测试targetPath', targetPath)
      deleteFolderRecursive(targetPath)

      // 获取上传的 zip 文件路径
      const filePath = file.path;

      // 使用 adm-zip 库解压文件
      const zip = new AdmZip(filePath);
      zip.extractAllTo(targetPath, true);
      const unlinkPath = path.join(__dirname, `../../../uploads/${file.filename}`)
      fs.unlinkSync(unlinkPath)

      // console.log('测试zzzzisPro2', isPro)

      if(isPro) {
        // const command = 'sudo systemctl restart nginx';

        const scriptPath = path.join(__dirname, './restart_nginx.sh');
        exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
          if (error) {
            // 执行出错时的处理逻辑
            console.error('执行命令出错:', error);
            res.status(500).send('执行命令出错');
            return;
          }
      
          // 执行成功时的处理逻辑
          console.log('命令执行结果:', stdout);
          res.status(200).send('命令执行成功');
        });
      } else {
        // 返回解压成功的响应
        res.send('文件上传和解压成功');
      }
    } catch (err) {
      console.log('测试uploadErr', err)
    }        
  });

  // 处理mobile文件上传的路由
  app.post('/upload_mobile', uploadInstance.single('file'), (req, res) => {
    try {
      const file = req.file
      console.log('上传文件信息', file)

      console.log('测试zzzzisPro1', isPro)

      // 解压后的目标路径
      // const targetPath = path.join(__dirname, uploadFolder);
      const targetPath = isPro ? '/usr/share/nginx/html/node-project-mobile' : '/Users/laurent.lin/Desktop/linyu/learn/node/node-project-frontend/dist'

      console.log('测试targetPath', targetPath)
      deleteFolderRecursive(targetPath)

      // 获取上传的 zip 文件路径
      const filePath = file.path;

      // 使用 adm-zip 库解压文件
      const zip = new AdmZip(filePath);
      zip.extractAllTo(targetPath, true);
      const unlinkPath = path.join(__dirname, `../../../uploads/${file.filename}`)
      fs.unlinkSync(unlinkPath)

      // console.log('测试zzzzisPro2', isPro)

      if(isPro) {
        console.log('zzzz')
        // const command = 'sudo systemctl restart nginx';

        const scriptPath = path.join(__dirname, './restart_nginx.sh');
        exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
          if (error) {
            // 执行出错时的处理逻辑
            console.error('执行命令出错:', error);
            res.status(500).send('执行命令出错');
            return;
          }
      
          // 执行成功时的处理逻辑
          console.log('命令执行结果:', stdout);
          res.status(200).send('命令执行成功');
        });
      } else {
        // 返回解压成功的响应
        res.send('文件上传和解压成功');
      }
    } catch (err) {
      console.log('测试uploadErr', err)
    }        
  });

  // 处理文件上传的路由
  app.post('/upload_manager', uploadInstance.single('file'), (req, res) => {
    try {
      const file = req.file
      console.log('上传文件信息', file)

      console.log('测试zzzzisPro1', isPro)

      // 解压后的目标路径
      // const targetPath = path.join(__dirname, uploadFolder);
      const targetPath = isPro ? '/usr/share/nginx/html/node-manager' : '/Users/laurent.lin/Desktop/linyu/learn/node/node-project-frontend/dist'

      console.log('测试targetPath', targetPath)
      deleteFolderRecursive(targetPath)

      // 获取上传的 zip 文件路径
      const filePath = file.path;

      // 使用 adm-zip 库解压文件
      const zip = new AdmZip(filePath);
      zip.extractAllTo(targetPath, true);
      const unlinkPath = path.join(__dirname, `../../../uploads/${file.filename}`)
      fs.unlinkSync(unlinkPath)

      // console.log('测试zzzzisPro2', isPro)

      if(isPro) {
        const scriptPath = path.join(__dirname, './restart_nginx.sh');
        exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
          if (error) {
            // 执行出错时的处理逻辑
            console.error('执行命令出错:', error);
            res.status(500).send('执行命令出错');
            return;
          }
      
          // 执行成功时的处理逻辑
          console.log('命令执行结果:', stdout);
          res.status(200).send('命令执行成功');
        });
      } else {
        // 返回解压成功的响应
        res.send('文件上传和解压成功');
      }
    } catch (err) {
      console.log('测试uploadErr', err)
    }        
  });
  // app.get('/yyy', (req, res) => {
  //   // 文件上传成功
  //   res.send('文件上传成功');
  // });

  // 更新后台
  app.post('/update_backend', (req, res) => {
    exec(`sh ${path.join(__dirname, './git_pull.sh')}`, (error, stdout, stderr) => {
      if (error) {
        // 执行出错时的处理逻辑
        console.error('执行命令出错:', error);
        res.status(500).send('执行命令出错');
        return;
      }

      exec(`sh ${path.join(__dirname, './yarn_install.sh')}`, (error, stdout, stderr) => {
        if (error) {
          // 执行出错时的处理逻辑
          console.error('执行命令出错:', error);
          res.status(500).send('执行命令出错');
          return;
        }
  
        exec(`sh ${path.join(__dirname, isPro ? './restart_forever.sh' : './restart_forever_dev.sh')}`, (error, stdout, stderr) => {
          if (error) {
            // 执行出错时的处理逻辑
            console.error('执行命令出错:', error);
            res.status(500).send('执行命令出错');
            return;
          }
    
          // 执行成功时的处理逻辑
          console.log('命令执行结果:', stdout);
          res.status(200).send('命令执行成功');
        });
      });      
    });
  })
}

module.exports = {
  uploadDeploy
}
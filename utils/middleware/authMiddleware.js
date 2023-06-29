const jwt = require('jsonwebtoken');
const { tokenKey } = require('../../config/index.js')
const passUrls = ['/login', '/register']

// 定义中间件函数
const authMiddleware = (req, res, next) => {
  if(passUrls.includes(req.url)) {
    next()
  } else {
    // 从请求头中获取 Authorization 标头
    console.log('测试header', req.headers.authorization)
    const token = req.headers.authorization;

    // 如果没有提供令牌，则返回未授权错误
    if (!token) {
      return res.status(401).json({ message: '未提供令牌' });
    }

    try {
      // 验证令牌的真实性
      const decoded = jwt.verify(token, tokenKey);
      
      // 将用户信息附加到请求对象中，以便在后续的路由处理程序中使用
      req.decoded = decoded;

      // 继续处理下一个中间件或路由处理程序
      next();
    } catch (err) {
      // 令牌无效或过期，返回错误响应
      return res.status(401).json({ message: '令牌无效或过期' });
    }
  }  
};

module.exports = authMiddleware;

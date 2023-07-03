module.exports = {
  "apps": [
    {
      "name": "node-project",
      "script": "app.js",
      "env": {
        "NODE_ENV": "pro",
        "HTTPS": "true",
        "SSL_CERT": "/etc/letsencrypt/live/bibibi.website/fullchain.pem",
        "SSL_KEY": "/etc/letsencrypt/live/bibibi.website/privkey.pem"
      }
    }
  ]
}
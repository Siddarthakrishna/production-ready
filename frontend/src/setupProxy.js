const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

module.exports = function(app) {
  // Serve static files from the public directory
  app.use('/financial', (req, res, next) => {
    const filePath = path.join(__dirname, '../public/financial', req.path.replace(/^\/financial\//, ''));
    
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // If it's an HTML file, read and send it
      if (filePath.endsWith('.html')) {
        const html = fs.readFileSync(filePath, 'utf8');
        res.set('Content-Type', 'text/html');
        return res.send(html);
      }
      
      // For other static files, serve them directly
      return res.sendFile(filePath);
    }
    
    // If file doesn't exist, continue to next middleware
    next();
  });

  // Proxy API requests to the backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000', // Update with your backend URL
      changeOrigin: true,
    })
  );
};
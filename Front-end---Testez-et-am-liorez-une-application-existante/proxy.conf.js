module.exports = {
  '/api': {
    target: 'http://localhost:8080',
    secure: false,
    onError: (err, req, res) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend unavailable', message: err.message }));
    },
  },
};

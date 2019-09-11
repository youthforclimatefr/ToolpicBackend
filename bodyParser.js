module.exports = function(req, res, next) {
  const buffers = [];
  req.on("data", function(chunk) {
    buffers.push(chunk);
  });
  req.on("end", function() {
    req.body = Buffer.concat(buffers);
    next();
  });
}

const middleware = function (req, res, next) {
    const { password, confirm_password } = req.body;
  
    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords don't match." });
    }
  
    next();
  };
  
  module.exports = middleware;
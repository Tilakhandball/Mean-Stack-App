const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => { // Here we are exporting a function because a middleware is a fn in node express.
  try {
    const token = req.headers.authorization.split(' ')[1]; // 'Bearer kjhdfja'
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId } // consecutive middleware will have this userdata available and it is added in express not in UI for the purpose of authorization.
    next();
  } catch{
    res.status(401).json({ message: 'You are not authenticated!' });
  }
}

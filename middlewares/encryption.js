const bcrypt = require('bcryptjs');

const encryptPassword = async (req, res, next) => {
  if (req.body.password) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
  }
  next();
};

module.exports = encryptPassword;

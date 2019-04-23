function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/main');
  }
  return next();
}
function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.render('index', {errors:'You must be logged in.'});
    return next(err);
  }
}
module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
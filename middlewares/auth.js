export const isAuthenticated = (req, res, next) => {
  if (!req.session.token) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/?error=Please log in to access this page');
  }
  next();
};
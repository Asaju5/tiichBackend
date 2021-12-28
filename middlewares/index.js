import expressJwt from "express-jwt";

export const requireLogin = expressJwt({
  getToken: (req, res) => req.cookies.token,
  secret: process.env.JWT,
  algorithms: ["HS256"],
});

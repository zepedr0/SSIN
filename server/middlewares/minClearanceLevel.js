const minClearanceLevel = (res, next, user, securityLevel) => {
  if (!user) {
    return res.status(401).json({ error: "Access denied" });
  }

  if (user.clearance_level < securityLevel) {
    return res.status(401).json({ error: "Access denied" });
  }

  next();
};

const securityLevel1 = (req, res, next) =>
  minClearanceLevel(res, next, req.body.auth_user, 1);

const securityLevel2 = (req, res, next) =>
  minClearanceLevel(res, next, req.body.auth_user, 2);

const securityLevel3 = (req, res, next) =>
  minClearanceLevel(res, next, req.body.auth_user, 3);

module.exports = { securityLevel1, securityLevel2, securityLevel3 };

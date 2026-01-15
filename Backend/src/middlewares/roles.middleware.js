export const requireAdminPlataforma = (req, res, next) => {
    if (req.user.Rol !== "admin_plataforma") {
      return res.status(403).json({ message: "Solo admin plataforma" });
    }
    next();
  };
  
  export const requireAdminClub = (req, res, next) => {
    if (req.user.Rol !== "admin_club") {
      return res.status(403).json({ message: "Solo admin de club" });
    }
    next();
  };
  
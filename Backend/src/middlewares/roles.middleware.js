export const requireAdminPlataforma = (req, res, next) => {
  if (req.user.Rol !== "admin_plataforma") {
    return res.status(403).json({ message: "Solo admin plataforma" });
  }
  next();
};

export const requireAdminClub = (req, res, next) => {
  if (req.user.Rol === "admin_plataforma") {
      return next();
  }

  if (req.user.Rol !== "admin_club") {
    return res.status(403).json({ message: "Solo admin de club" });
  }
  next();
};

export const requireGestionClub = (req, res, next) => {
  const { Rol, club_id } = req.user;
  const idClubUrl = req.params.id; // El ID del club que viene en la URL

  // 1. El Admin de Plataforma es Dios, entra a cualquier club
  if (Rol === "admin_plataforma") {
      return next();
  }

  // 2. Si es Admin de Club o Entrenador, verificamos que sea SU club
  if ((Rol === "admin_club" || Rol === "entrenador") && club_id == idClubUrl) {
      return next();
  }

  // 3. Si no cumple nada de lo anterior, fuera
  return res.status(403).json({ 
      message: "No tienes permisos para gestionar este club o no perteneces a él" 
  });
};
  
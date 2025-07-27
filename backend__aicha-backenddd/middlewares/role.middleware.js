/*exports.roleMiddleware = (allowedRoles) => (req, res, next) => {
  const userRole = req.user.role; // Récupéré du JWT
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  
  next();
};*/


exports.roleMiddleware = (allowedRoles) => {
  // Vérifie si allowedRoles est un tableau, sinon le convertit en tableau
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: 'Rôle utilisateur non défini' });
    }

    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accès refusé. Rôles autorisés: ${rolesArray.join(', ')}`,
        yourRole: req.user.role,
        requiredRoles: rolesArray
      });
    }

    next();
  };
};

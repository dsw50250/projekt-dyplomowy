// Функция для проверки ролей
export const requireRole = (roles) => {
  return (req, res, next) => {
    // req.user должен быть уже создан в authenticateToken
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Проверка роли
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient rights" });
    }

    next();
  };
};
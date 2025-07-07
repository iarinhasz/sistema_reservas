const adminMiddleware = (req, res, next) => {
  // O auth.middleware já deve ter colocado os dados do usuário em req.user
    if (req.user && req.user.tipo === 'administrador') {
        next(); // Usuário é admin, pode prosseguir
    } else {
        res.status(403).json({ message: 'Acesso proibido. Rota exclusiva para administradores.' });
    }
};

export default adminMiddleware;
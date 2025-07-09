const adminMiddleware = (req, res, next) => {

    if (!req.user) {
    return res.status(403).json({ message: 'Acesso proibido. Falha na autenticação.' });
    }
    
    const { tipo, status } = req.user;

    if (tipo === 'administrador' && status === 'ativo') {
        next();
        } else {
        res.status(403).json({ message: 'Acesso proibido. Rota exclusiva para administradores ativos.' });
    }
};

export default adminMiddleware;
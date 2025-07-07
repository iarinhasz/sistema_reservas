import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona os dados do usuário (payload) ao objeto da requisição
        next(); // Se o token for válido, continua para a próxima etapa
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
};

export default authMiddleware;
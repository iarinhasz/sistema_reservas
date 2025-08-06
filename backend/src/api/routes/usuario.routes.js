
import { Router } from 'express';
// Importa a instância pronta do container!
import { usuarioController } from '../../container.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = Router();
router.post('/solicitar', usuarioController.solicitarCadastro);
router.get(
    '/pendentes',
    authMiddleware,       
    adminMiddleware,      
    usuarioController.listarPendentes
);

// Rota para APROVAR um cadastro
router.post(
    '/:cpf/aprovar',
    authMiddleware,
    adminMiddleware,
    usuarioController.aprovarCadastro
);

// Rota para REJEITAR um cadastro
router.post(
    '/:cpf/rejeitar',
    authMiddleware,
    adminMiddleware,
    usuarioController.rejeitarCadastro
);

export default router;
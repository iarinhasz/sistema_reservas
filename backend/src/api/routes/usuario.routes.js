
import { Router } from 'express';
import { usuarioController } from '../../container.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = Router();
router.post('/solicitar', usuarioController.solicitarCadastro);

router.get(
    '/', 
    authMiddleware, 
    adminMiddleware, 
    usuarioController.listarTodos
);


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

router.patch(
    '/:cpf/senha',
    authMiddleware,
    usuarioController.alterarSenha
);

router.delete(
    '/:cpf',
    authMiddleware,
    adminMiddleware,
    usuarioController.delete
);

export default router;
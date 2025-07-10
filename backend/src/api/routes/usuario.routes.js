import { Router } from 'express';
import usuarioController from '../controllers/usuario.controller.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/solicitar', usuarioController.create);
router.get('/', authMiddleware, adminMiddleware, usuarioController.listarTodos);
router.get('/pendentes', authMiddleware, adminMiddleware, usuarioController.listarPendentes);
router.post('/:cpf/aprovar', authMiddleware, adminMiddleware, usuarioController.aprovarCadastro);
router.post('/:cpf/rejeitar', authMiddleware, adminMiddleware, usuarioController.rejeitarCadastro);
router.patch('/:cpf', authMiddleware, adminMiddleware, usuarioController.editarUsuario);


export default router;
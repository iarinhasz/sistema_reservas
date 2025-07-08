import { Router } from 'express';
import equipamentoController from '../controllers/equipamento.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = Router();

router.post('/', authMiddleware, adminMiddleware, equipamentoController.create);
router.get('/', authMiddleware, equipamentoController.listAll);
router.get('/:id', authMiddleware, equipamentoController.getById);
router.put('/:id', authMiddleware, adminMiddleware, equipamentoController.update);
router.delete('/:id', authMiddleware, adminMiddleware, equipamentoController.delete);

export default router;

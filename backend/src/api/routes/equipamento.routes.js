import { Router } from 'express';
import { equipamentoController } from '../../container.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Agora sem a necessidade do .bind()
router.post('/', authMiddleware, adminMiddleware, equipamentoController.create);
router.patch('/:id', authMiddleware, adminMiddleware, equipamentoController.update);
router.delete('/:id', authMiddleware, adminMiddleware, equipamentoController.delete); // Usando o método 'delete'

// Usando o método 'findAll' padronizado
router.get('/', equipamentoController.listAll);
router.get('/:id', equipamentoController.getById);

export default router;
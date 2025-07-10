import { Router } from 'express';
import equipamentoController from '../controllers/equipamento.controller.js';
import adminMiddleware from '../middlewares/admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';


const router = Router();
//somente admi
router.post('/', authMiddleware, adminMiddleware, equipamentoController.create);
router.put('/:id', authMiddleware, adminMiddleware, equipamentoController.update);
router.delete('/:id', authMiddleware, adminMiddleware, equipamentoController.delete);

router.get('/', equipamentoController.listAll);
router.get('/:id', equipamentoController.getById);


export default router;

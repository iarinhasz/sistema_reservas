import { Router } from 'express';
import EquipamentoController from '../controllers/equipamento.controller.js'; // Importa a CLASSE
import adminMiddleware from '../middlewares/admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

const equipamentoController = new EquipamentoController();

router.post('/', authMiddleware, adminMiddleware, equipamentoController.create.bind(equipamentoController));
router.patch('/:id', authMiddleware, adminMiddleware, equipamentoController.update.bind(equipamentoController));
router.delete('/:id', authMiddleware, adminMiddleware, equipamentoController.delete_.bind(equipamentoController));

router.get('/', equipamentoController.listAll.bind(equipamentoController));
router.get('/:id', equipamentoController.getById.bind(equipamentoController));

export default router;
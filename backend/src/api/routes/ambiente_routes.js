import { Router } from 'express';
import ambienteController from '../controllers/ambiente_controller.js';
import adminMiddleware from '../middlewares/admin.middleware.js'; // Importa o segundo guardião
import authMiddleware from '../middlewares/auth.middleware.js'; // Importa o guardião


const router = Router();

//rotas protegidas pelo admin:
router.post('/', authMiddleware, adminMiddleware, ambienteController.create);
router.patch('/:id', authMiddleware, adminMiddleware, ambienteController.update); 
router.delete('/:id', authMiddleware, adminMiddleware, ambienteController.delete);

//rotas livres

router.get('/', ambienteController.listAll);
router.get('/:id', ambienteController.getById);

export default router;
import { Router } from 'express';
import { ambienteController } from '../../container.js';

import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';


const router = Router();

//rotas protegidas pelo admin:
router.post('/', authMiddleware, adminMiddleware, ambienteController.create);
router.patch('/:id', authMiddleware, adminMiddleware, ambienteController.update); 
// router.delete('/:id', authMiddleware, adminMiddleware, ambienteController.delete);

//rotas livres

router.get('/', ambienteController.listAll);
router.get('/:id', ambienteController.getById);

export default router;
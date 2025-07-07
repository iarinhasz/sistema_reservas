import { Router } from 'express';
import ambienteController from '../controllers/ambiente_controller.js';
import adminMiddleware from '../middlewares/admin.middleware.js'; // Importa o segundo guardião
import authMiddleware from '../middlewares/auth.middleware.js'; // Importa o guardião


const router = Router();
router.get('/', ambienteController.listAll);
//somente adm podem criar um ambiente novo
router.post('/', authMiddleware, adminMiddleware, ambienteController.create);

export default router;
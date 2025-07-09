import { Router } from 'express';
import ambienteController from '../controllers/ambiente_controller.js';
import adminMiddleware from '../middlewares/admin.middleware.js'; // Importa o segundo guardião
import authMiddleware from '../middlewares/auth.middleware.js'; // Importa o guardião


const router = Router();

router.get('/', ambienteController.listAll);
//somente adm podem criar um ambiente novo
router.post('/', authMiddleware, adminMiddleware, ambienteController.create);
// Rota para buscar um ambiente específico pelo ID (pode ser pública ou apenas para logados)
router.get('/:id', ambienteController.getById);

// Rota para atualizar um ambiente (protegida para admins)
router.put('/:id', authMiddleware, adminMiddleware, ambienteController.update);

// Rota para deletar um ambiente (protegida para admins)
router.delete('/:id', authMiddleware, adminMiddleware, ambienteController.delete);



export default router;
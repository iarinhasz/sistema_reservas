import { Router } from 'express';
import ambienteController from '../controllers/ambiente_controller.js';
import adminMiddleware from '../middlewares/admin.middleware.js'; // Importa o segundo guardião
import authMiddleware from '../middlewares/auth.middleware.js'; // Importa o guardião


const router = Router();

// Rotas GET agora protegidas para usuários autenticados
router.get('/', authMiddleware, ambienteController.listAll);
router.get('/:id', authMiddleware, ambienteController.getById);

// Rotas de modificação protegidas para administradores
router.post('/', authMiddleware, adminMiddleware, ambienteController.create);

// Rota para atualizar um ambiente (protegida para admins)
router.put('/:id', authMiddleware, adminMiddleware, ambienteController.update);

// Rota para deletar um ambiente (protegida para admins)
router.delete('/:id', authMiddleware, adminMiddleware, ambienteController.delete);



export default router;
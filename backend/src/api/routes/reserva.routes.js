import { Router } from 'express';
import reservaController from '../controllers/reserva.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = Router();

// Rota para um usuário autenticado solicitar uma reserva
router.post('/', authMiddleware, reservaController.solicitar);

// Rota para um usuário autenticado ver suas próprias reservas
router.get('/mine', authMiddleware, reservaController.listMine);

// Rota para um administrador listar TODAS as reservas
router.get('/', authMiddleware, adminMiddleware, reservaController.listAll);

// Rotas para um administrador aprovar ou rejeitar uma solicitação
router.put('/:id/aprovar', authMiddleware, adminMiddleware, reservaController.aprovar);
router.put('/:id/rejeitar', authMiddleware, adminMiddleware, reservaController.rejeitar);

// Rota para um usuário cancelar sua própria reserva (ou um admin cancelar qualquer uma)
router.put('/:id/cancelar', authMiddleware, reservaController.cancelar);

export default router;
import { Router } from 'express';
import { reservaController } from '../../container.js';

import adminMiddleware from '../middlewares/admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Rota para um usuário autenticado solicitar uma reserva
router.post('/', authMiddleware, reservaController.solicitar);

// Rota para um usuário autenticado ver suas próprias reservas
router.get('/mine', authMiddleware, reservaController.listMine);

// Rota para um administrador listar TODAS as reservas
router.get('/', reservaController.listAll);

// Rotas para um administrador aprovar ou rejeitar uma solicitação
router.put('/:id/aprovar', authMiddleware, adminMiddleware, reservaController.aprovar);
router.put('/:id/rejeitar', authMiddleware, adminMiddleware, reservaController.rejeitar);

// Rota para um usuário cancelar sua própria reserva (ou um admin cancelar qualquer uma)
router.put('/:id/cancelar', authMiddleware, reservaController.cancelar);

//Rota para o usuário deixar uma review sobre uma reserva feita
router.post('/:id/review', authMiddleware, reservaController.deixarReview);

router.post('/admin-create', authMiddleware, adminMiddleware, reservaController.criarReservaAdmin);

export default router;
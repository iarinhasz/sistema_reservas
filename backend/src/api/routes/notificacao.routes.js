import { Router } from 'express';
import notificacaoController from '../controllers/notificacao.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = Router();

router.get(
    '/summary',
    authMiddleware,
    adminMiddleware,
    notificacaoController.getSummary
);

export default router;
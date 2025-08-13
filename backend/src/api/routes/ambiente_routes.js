import { Router } from 'express';
import { ambienteController } from '../../container.js';
import { body, validationResult } from 'express-validator';

import adminMiddleware from '../middlewares/admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';


const router = Router();

//rotas protegidas pelo admin:
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    // --- CADEIA DE VALIDAÇÃO ---
    [body('identificacao')
    .trim()
    .notEmpty().withMessage('O identificador é obrigatório.')
    .isLength({ min: 3 }).withMessage('O identificador deve ter no mínimo 3 caracteres.')
    .matches(/^[\p{L}0-9\s-]+$/u)
    .withMessage('O identificador pode conter apenas letras, números, espaços e hífens.')],
    (req, res) => ambienteController.create(req, res)
);
router.patch('/:id', authMiddleware, adminMiddleware, ambienteController.update); 
router.delete('/:id', authMiddleware, adminMiddleware, ambienteController.delete);

//rotas livres

router.get('/', ambienteController.listAll);
router.get('/:id', ambienteController.getById);

export default router;
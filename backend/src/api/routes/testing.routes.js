import { Router } from 'express';
import testingController from '../controllers/testing.controller.js';

const router = Router();

// Rota para limpar e preparar o banco para um novo teste
router.post('/reset', testingController.resetDatabase);
router.post('/usuario-ativo', testingController.createActiveUser);



export default router;
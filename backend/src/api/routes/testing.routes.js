import { Router } from 'express';
import { testingController } from '../../container.js'; 


const router = Router();

// Rota para limpar e preparar o banco para um novo teste
router.post('/reset', testingController.resetDatabase);
router.post('/usuario-ativo', testingController.createActiveUser);
router.post('/createReserva', testingController.createReserva);



export default router;
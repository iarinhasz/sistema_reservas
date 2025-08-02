
import { Router } from 'express';
// Importa a instância pronta do container!
import { usuarioController } from '../../container.js';

const router = Router();
router.post('/:cpf/aprovar', usuarioController.aprovarCadastro);
router.post('/:cpf/rejeitar', usuarioController.rejeitarCadastro);
router.post('/',usuarioController.solicitarCadastro)

export default router;
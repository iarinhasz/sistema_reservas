
import { Router } from 'express';
// Importa a instância pronta do container!
import { usuarioController } from '../../container.js';

const router = Router();
router.post('/:cpf/aprovar', usuarioController.aprovarCadastro);
router.post('/:cpf/rejeitar', usuarioController.rejeitarCadastro);
// ... resto das rotas

export default router;
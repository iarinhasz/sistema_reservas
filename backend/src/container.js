
import UsuarioModel from './api/models/usuario.model.js';
import EmailService from './api/services/email.service.js'; // Supondo que também virou classe
import UsuarioService from './api/services/usuario.service.js';
import UsuarioController from './api/controllers/usuario.controller.js';

// ... importe as outras classes de ambiente, equipamento, reserva ...

// 2. Monta o quebra-cabeça (de baixo para cima)

// == CAMADA DE MODELOS == (sem dependências)
const usuarioModel = UsuarioModel; // Como usamos 'static', não precisa de 'new'
// ... outros models

// == CAMADA DE SERVIÇOS == (dependem dos models)
const emailService = new EmailService();
const usuarioService = new UsuarioService(usuarioModel, emailService);
// ... outros serviços

// == CAMADA DE CONTROLLERS == (dependem dos serviços)
export const usuarioController = new UsuarioController(usuarioService);
// ... exporte os outros controllers instanciados

// No final, você exporta apenas as instâncias dos controllers,
// que serão usadas pelas rotas.
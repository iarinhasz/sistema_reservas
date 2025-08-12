//modelos
import AmbienteModel from './api/models/ambiente.model.js';
import EquipamentoModel from './api/models/equipamento.model.js';
import ReservaModel from './api/models/reserva.model.js';
import UsuarioModel from './api/models/usuario.model.js';
import appEmitter from './events/appEmitter.js';

// Serviços
import AmbienteService from './api/services/ambiente.service.js';
import AuthService from './api/services/auth.service.js';
import EmailService from './api/services/email.service.js';
import EquipamentoService from './api/services/equipamento.service.js';
import ReservaService from './api/services/reserva.service.js';
import UsuarioService from './api/services/usuario.service.js';

// Controllers
import AmbienteController from './api/controllers/ambiente.controller.js';
import AuthController from './api/controllers/auth.controller.js';
import EquipamentoController from './api/controllers/equipamento.controller.js';
import ReservaController from './api/controllers/reserva.controller.js';
import UsuarioController from './api/controllers/usuario.controller.js';

import pool from './config/database.js';

// == CAMADA DE MODELOS ==
const usuarioModel = new UsuarioModel(pool); 
const ambienteModel = new AmbienteModel(pool);
const equipamentoModel = new EquipamentoModel(pool);
const reservaModel = new ReservaModel(pool);

// == CAMADA DE SERVIÇOS ==
const emailService = new EmailService();
const usuarioService = new UsuarioService(usuarioModel, emailService, appEmitter);
const ambienteService = new AmbienteService(ambienteModel, reservaModel);
// Passe o appEmitter para o ReservaService
const reservaService = new ReservaService(reservaModel, usuarioModel, emailService, appEmitter);
const equipamentoService = new EquipamentoService(equipamentoModel, reservaModel, ambienteModel);
const authService = new AuthService(usuarioModel);

// == CAMADA DE CONTROLLERS ==
const usuarioController = new UsuarioController(usuarioService);
const ambienteController = new AmbienteController(ambienteService);
const reservaController = new ReservaController(reservaService);
const equipamentoController = new EquipamentoController(equipamentoService);
const authController = new AuthController(authService);

export {
    ambienteController, authController, equipamentoController, reservaController,
    usuarioController
};

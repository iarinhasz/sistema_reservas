
//modelos
import AmbienteModel from './api/models/ambiente.model.js';
import EquipamentoModel from './api/models/equipamento.model.js';
//import ReservaModel from './api/models/reserva.model.js';
import UsuarioModel from './api/models/usuario.model.js';

// Serviços
import AmbienteService from './api/services/ambiente.service.js';
import EmailService from './api/services/email.service.js';
import UsuarioService from './api/services/usuario.service.js';
import EquipamentoService from './api/services/equipamento.service.js';

// Controllersgit
import AmbienteController from './api/controllers/ambiente.controller.js';
import UsuarioController from './api/controllers/usuario.controller.js';
import EquipamentoController from './api/controllers/equipamento.controller.js';

import AuthController from './api/controllers/auth.controller.js';



import pool from './config/database.js';


// == CAMADA DE MODELOS == (sem dependências) hsdghfsdhfjsk
const usuarioModel = UsuarioModel; 
const ambienteModel = new AmbienteModel(pool);
const equipamentoModel = new EquipamentoModel(pool);
//const reservaModel = new ReservaModel(pool);
// ... outros models

// == CAMADA DE SERVIÇOS == (dependem dos models)
const emailService = new EmailService();
const usuarioService = new UsuarioService(usuarioModel, emailService);
const ambienteService = new AmbienteService(ambienteModel);
const equipamentoService = new EquipamentoService(equipamentoModel, reservaModel, ambienteModel);

// == CAMADA DE CONTROLLERS == (dependem dos serviços)
const usuarioController = new UsuarioController(usuarioService);
const ambienteController = new AmbienteController(ambienteService);
const equipamentoController = new EquipamentoController(equipamentoService);

// ... exporte os outros controllers instanciados

// No final, você exporta apenas as instâncias dos controllers,
// que serão usadas pelas rotas.
export {
    usuarioController,
    ambienteController,
    equipamentoController
};

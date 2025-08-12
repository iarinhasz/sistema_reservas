import pool from '../../config/database.js';

class NotificacaoController {
    async getSummary(req, res, next) {
        try {
            const userQuery = "SELECT COUNT(*) FROM usuarios WHERE status = 'pendente'";
            const userResult = await pool.query(userQuery);
            const hasNewUserRequest = parseInt(userResult.rows[0].count, 10) > 0;

            const reservationQuery = `
                SELECT DISTINCT recurso_id 
                FROM reservas 
                WHERE recurso_tipo = 'ambiente' AND status = 'pendente'`;
            const reservationResult = await pool.query(reservationQuery);
            const newReservationAlerts = reservationResult.rows.map(row => row.recurso_id);

            res.status(200).json({
                hasNewUserRequest,
                newReservationAlerts
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new NotificacaoController();
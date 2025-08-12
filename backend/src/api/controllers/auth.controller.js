class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    login = async (req, res) => {
        try {
            const { email, senha } = req.body;
            const token = await this.authService.login(email, senha);

            res.status(200).json({
                message: 'Login bem-sucedido!',
                token: token
            });

        } catch (error) {
            // Usa o statusCode definido no serviço ou um padrão 500
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}

export default AuthController;
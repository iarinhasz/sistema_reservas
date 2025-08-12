import axios from 'axios';

const api = axios.create({
    // A URL base do seu backend. Ajuste a porta se for diferente.
    baseURL: 'http://localhost:3000/api', 
});

// Este trecho é muito útil: ele intercepta todas as requisições
// e anexa o token de autenticação, se ele existir.
api.interceptors.request.use(async config => {
    const token = localStorage.getItem('authToken'); // Busca o token salvo no navegador
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
//interceptor de resposta
api.interceptors.response.use(
    // Se a resposta for um sucesso (status 2xx), apenas a retorna
    response => response,
    
    // Se a resposta for um erro...
    error => {
        // Verifica se o erro é de 'Não Autorizado' (token expirado/inválido)
        if (error.response && error.response.status === 401) {
            // Se for um erro 401, remove o token antigo e recarrega a página para o login.
            // O ideal é ter uma função de logout centralizada.
            localStorage.removeItem('authToken');
            // Redireciona para a página de login
            window.location = '/login'; 
        }

        // Para todos os outros erros, apenas rejeita a promise para que o .catch() no componente possa lidar com eles
        return Promise.reject(error);
    }
);

export default api;
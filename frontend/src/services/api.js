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

export default api;
import { useContext } from 'react';
import { NotificacaoContext } from '../context/NotificacaoContext.jsx';

export const useNotificacao = () => {
    const context = useContext(NotificacaoContext);
    if (context === undefined) {
        throw new Error('useNotificacao deve ser usado dentro de um NotificacaoProvider');
    }
    return context;
};

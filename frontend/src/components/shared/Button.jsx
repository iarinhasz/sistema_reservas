import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled }) => {
    // Definimos os estilos base para todos os botões
    const baseStyles = 'font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200';

    // Definimos estilos variantes para diferentes tipos de botões
    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-green-600 hover:bg-green-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        cancel: 'bg-gray-500 hover:bg-gray-600 text-white',
    };
    
    // Combinamos o estilo base com o estilo da variante escolhida
    const combinedStyles = `${baseStyles} ${variantStyles[variant]}`;

    return (
        <button
            type={type}
            onClick={onClick}
            className={combinedStyles}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
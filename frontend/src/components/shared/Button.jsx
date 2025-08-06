import React from 'react';
import clsx from 'clsx'; // Importa a biblioteca clsx

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // 'primary', 'secondary', 'danger', etc.
    className = '', // Para adicionar classes extras, se necessário
    disabled = false,
    icon: Icon, // Prop para receber um componente de ícone
}) => {
    // Estilos base, aplicados a TODOS os botões
    const baseStyles =
        'flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

    // Estilos variantes, que mudam conforme a prop 'variant'
    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        cancel: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400',
    };

    // Estilos para o estado 'disabled'
    const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed';

    // clsx() combina todas as classes de forma inteligente
    const combinedClassName = clsx(
        baseStyles,
        variantStyles[variant],
        disabledStyles,
        className
    );

    return (
        <button
            type={type}
            onClick={onClick}
            className={combinedClassName}
            disabled={disabled}
        >
            {/* Renderiza o ícone apenas se ele for passado como prop */}
            {Icon && <Icon className="h-5 w-5" />}
            {children}
        </button>
    );
};

export default Button;
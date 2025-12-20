import { View, Text, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    title?: string;
    subtitle?: string;
    variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ title, subtitle, children, className, variant = 'default', ...props }: CardProps) {
    const variants = {
        default: 'bg-white rounded-lg p-4',
        elevated: 'bg-white rounded-lg p-4 shadow-md',
        outlined: 'bg-white rounded-lg p-4 border border-gray-200',
    };

    return (
        <View className={`${variants[variant]} ${className}`} {...props}>
            {title && <Text className="text-gray-900 font-semibold text-lg mb-1">{title}</Text>}
            {subtitle && <Text className="text-gray-500 text-sm mb-3">{subtitle}</Text>}
            {children}
        </View>
    );
}

import { Text, ViewProps } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface BentoCardProps extends ViewProps {
    title?: string;
    subtitle?: string;
    delay?: number;
}

export function BentoCard({ title, subtitle, children, className, delay = 0, ...props }: BentoCardProps) {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay).springify()}
            className={`bg-surface/50 rounded-3xl p-4 border border-white/5 ${className}`}
            {...props}
        >
            {title && <Text className="text-textPrimary font-display font-bold text-lg mb-1">{title}</Text>}
            {subtitle && <Text className="text-textSecondary font-sans text-xs mb-3">{subtitle}</Text>}
            {children}
        </Animated.View>
    );
}

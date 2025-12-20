import { BlurView } from 'expo-blur';
import { ViewProps } from 'react-native';

export function GlassView({ className, intensity = 80, tint = 'dark', children, ...props }: ViewProps & { intensity?: number, tint?: 'light' | 'dark' | 'default' }) {
    return (
        <BlurView intensity={intensity} tint={tint} className={`overflow-hidden border border-white/10 ${className}`} {...props}>
            {children}
        </BlurView>
    );
}

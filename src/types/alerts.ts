export type AlertEffect = 'confetti' | 'sparkles' | 'fireworks' | 'hearts';

export interface MessageAlertConfig {
  textAlignment: 'left' | 'center' | 'right';
  fontFamily: string;
  textShadow: boolean;
  textAnimation: string;
  effects: AlertEffect[];
  useGradient: boolean;
  gradientColor: string;
}
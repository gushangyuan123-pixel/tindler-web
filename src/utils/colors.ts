// IceLatte Design System Colors
export const colors = {
  // Primary Brutalist Palette
  acidYellow: '#FFEB00',
  hotPink: '#FF0080',
  electricBlue: '#0080FF',

  // Neutrals
  black: '#000000',
  white: '#FFFFFF',
  darkGray: '#1A1A1A',
  mediumGray: '#4D4D4D',
  lightGray: '#E5E5E5',

  // Accent Colors
  successGreen: '#00E566',
  warningOrange: '#FF8000',
} as const;

export type ColorKey = keyof typeof colors;

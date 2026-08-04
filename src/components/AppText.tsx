import React from 'react';
import {Text as RNText, TextProps, TextStyle, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {Typography, FontFamily} from '../theme/typography';

type TypographyVariant = keyof typeof Typography;
type FontWeight =
  | 'thin'
  | 'extraLight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semiBold'
  | 'bold'
  | 'extraBold'
  | 'black';

interface AppTextProps extends TextProps {
  /** Pre-defined typography variant */
  variant?: TypographyVariant;
  /** Text color - defaults to neutral.900 */
  color?: string;
  /** Font weight override */
  weight?: FontWeight;
  /** Center align text */
  center?: boolean;
  /** Italic style */
  italic?: boolean;
  children: React.ReactNode;
}

const weightToFamily: Record<FontWeight, string> = {
  thin: FontFamily.thin,
  extraLight: FontFamily.extraLight,
  light: FontFamily.light,
  regular: FontFamily.regular,
  medium: FontFamily.medium,
  semiBold: FontFamily.semiBold,
  bold: FontFamily.bold,
  extraBold: FontFamily.extraBold,
  black: FontFamily.black,
};

const weightToItalicFamily: Record<FontWeight, string> = {
  thin: FontFamily.thinItalic,
  extraLight: FontFamily.extraLightItalic,
  light: FontFamily.lightItalic,
  regular: FontFamily.italic,
  medium: FontFamily.mediumItalic,
  semiBold: FontFamily.semiBoldItalic,
  bold: FontFamily.boldItalic,
  extraBold: FontFamily.extraBoldItalic,
  black: FontFamily.blackItalic,
};

export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyMedium',
  color = Colors.neutral[900],
  weight,
  center = false,
  italic = false,
  style,
  children,
  ...rest
}) => {
  const variantStyle = Typography[variant] || Typography.bodyMedium;

  const resolvedStyle: TextStyle = {
    ...variantStyle,
    color,
    ...(center && {textAlign: 'center'}),
  };

  // Override font family if weight is specified
  if (weight) {
    resolvedStyle.fontFamily = italic
      ? weightToItalicFamily[weight]
      : weightToFamily[weight];
  } else if (italic && variantStyle.fontFamily) {
    // Map current family to italic version
    const currentFamily = variantStyle.fontFamily as string;
    const familyKey = Object.entries(FontFamily).find(
      ([_, v]) => v === currentFamily,
    )?.[0] as FontWeight | undefined;

    if (familyKey && !familyKey.includes('Italic')) {
      const italicKey = (familyKey + 'Italic') as keyof typeof FontFamily;
      if (FontFamily[italicKey]) {
        resolvedStyle.fontFamily = FontFamily[italicKey];
      }
    }
  }

  return (
    <RNText style={[resolvedStyle, style]} {...rest}>
      {children}
    </RNText>
  );
};

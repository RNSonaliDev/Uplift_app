import React from 'react';
import {Text as RNText, TextProps, TextStyle, StyleSheet, Platform} from 'react-native';
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

const emojiRegex = /(\p{Extended_Pictographic}+)/u;

const formatChildWithEmoji = (child: React.ReactNode): React.ReactNode => {
  if (typeof child !== 'string') {
    return child;
  }

  if (!/\p{Extended_Pictographic}/u.test(child)) {
    return child;
  }

  const parts = child.split(emojiRegex);
  return parts.map((part, index) => {
    if (/\p{Extended_Pictographic}/u.test(part)) {
      return (
        <RNText key={index} style={styles.emojiSpan}>
          {part}
        </RNText>
      );
    }
    return part;
  });
};

const formatChildren = (children: React.ReactNode): React.ReactNode => {
  if (Array.isArray(children)) {
    return children.map((child, i) => (
      <React.Fragment key={i}>
        {formatChildWithEmoji(child)}
      </React.Fragment>
    ));
  }
  return formatChildWithEmoji(children);
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
      {formatChildren(children)}
    </RNText>
  );
};

const styles = StyleSheet.create({
  emojiSpan: {
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
});

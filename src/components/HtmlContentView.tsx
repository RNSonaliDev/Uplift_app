import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Colors } from '../theme/colors';
import { moderateScale } from '../utils/responsive';

interface HtmlContentViewProps {
  htmlContent: string;
  textColor?: string;
  fontSize?: number;
  contentWidth?: number;
}

export const HtmlContentView: React.FC<HtmlContentViewProps> = ({
  htmlContent,
  textColor = Colors.neutral[600],
  fontSize = moderateScale(14),
  contentWidth,
}) => {
  const { width } = useWindowDimensions();
  const effectiveWidth = contentWidth || width - 60;

  if (!htmlContent || !htmlContent.trim()) {
    return null;
  }

  // Check if string contains HTML tags. If plain text, convert newlines to <br/>
  const isHtml = /<[a-z][\s\S]*>/i.test(htmlContent);
  const formattedHtml = isHtml 
    ? htmlContent 
    : htmlContent.replace(/\n/g, '<br/>');

  return (
    <RenderHtml
      contentWidth={effectiveWidth}
      source={{ html: `<div>${formattedHtml}</div>` }}
      tagsStyles={{
        body: {
          color: textColor,
          lineHeight: 24,
          fontSize: fontSize,
          fontFamily: 'Poppins-Regular',
          margin: 0,
          padding: 0,
        },
        div: {
          color: textColor,
          lineHeight: 24,
          fontSize: fontSize,
          fontFamily: 'Poppins-Regular',
        },
        p: {
          marginTop: 4,
          marginBottom: 8,
          lineHeight: 24,
          fontSize: fontSize,
          color: textColor,
          fontFamily: 'Poppins-Regular',
        },
        b: {
          fontFamily: 'Poppins-Bold',
          color: Colors.neutral[900],
        },
        strong: {
          fontFamily: 'Poppins-Bold',
          color: Colors.neutral[900],
        },
        i: {
          fontFamily: 'Poppins-Italic',
        },
        em: {
          fontFamily: 'Poppins-Italic',
        },
        ul: {
          marginTop: 4,
          marginBottom: 8,
          paddingLeft: 16,
        },
        ol: {
          marginTop: 4,
          marginBottom: 8,
          paddingLeft: 16,
        },
        li: {
          lineHeight: 22,
          fontSize: fontSize,
          color: textColor,
          fontFamily: 'Poppins-Regular',
          marginBottom: 4,
        },
        h1: {
          color: Colors.neutral[900],
          fontSize: moderateScale(20),
          fontFamily: 'Poppins-Bold',
          marginTop: 12,
          marginBottom: 6,
        },
        h2: {
          color: Colors.neutral[900],
          fontSize: moderateScale(18),
          fontFamily: 'Poppins-Bold',
          marginTop: 10,
          marginBottom: 6,
        },
        h3: {
          color: Colors.neutral[900],
          fontSize: moderateScale(16),
          fontFamily: 'Poppins-SemiBold',
          marginTop: 8,
          marginBottom: 4,
        },
        h4: {
          color: Colors.neutral[900],
          fontSize: moderateScale(15),
          fontFamily: 'Poppins-SemiBold',
          marginTop: 6,
          marginBottom: 4,
        },
        a: {
          color: Colors.primary[600],
          textDecorationLine: 'underline',
        },
      }}
    />
  );
};

import React from 'react';
import {View, Image} from 'react-native';
import {AppText} from '../components/AppText';
import {Colors} from '../theme/colors';
import {fontScale} from '../utils/responsive';
import {logo} from '../assets/images';

interface UpliftLogoProps {
  /** Size multiplier - controls overall logo size */
  size?: number;
  /** Whether to show the "Uplift" text below the icon */
  showText?: boolean;
}

export const UpliftLogo: React.FC<UpliftLogoProps> = ({
  size = 1,
  showText = true,
}) => {
  const iconWidth = 80 * size;
  const iconHeight = 80 * size;

  return (
    <View style={{alignItems: 'center'}}>
      <Image 
        source={logo}
        style={{width: 200, height: 100}}
        resizeMode="contain"
      />
    </View>
  );
};

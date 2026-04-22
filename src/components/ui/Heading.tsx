import { Text, TextStyle, StyleProp } from 'react-native';
import { ReactNode } from 'react';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type HeadingLevel = 1 | 2 | 3;

interface HeadingProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  level?: HeadingLevel;
  color?: string;
}

const SIZE_BY_LEVEL: Record<HeadingLevel, number> = {
  1: 24,
  2: 20,
  3: 18,
};

export function Heading({ children, style, level = 1, color = colors.primary }: HeadingProps) {
  return (
    <Text
      style={[
        {
          fontFamily: fonts.heading,
          color,
          fontSize: SIZE_BY_LEVEL[level],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export default Heading;

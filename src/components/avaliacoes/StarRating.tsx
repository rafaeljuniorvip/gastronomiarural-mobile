import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
  color?: string;
}

export default function StarRating({
  value,
  onChange,
  size = 36,
  readOnly = false,
  color = '#D4A842',
}: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        if (readOnly) {
          return (
            <Icon
              key={n}
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={color}
              style={styles.star}
            />
          );
        }
        return (
          <TouchableOpacity
            key={n}
            onPress={() => onChange?.(n)}
            accessibilityLabel={`${n} estrelas`}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Icon
              name={filled ? 'star' : 'star-outline'}
              size={size}
              color={color}
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  star: { marginHorizontal: 2 },
});

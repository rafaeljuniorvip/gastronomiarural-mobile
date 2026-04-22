import { ScrollView, TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import { fonts } from '../../theme/fonts';

export interface ChipOption {
  value: string;
  label: string;
}

interface Props {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  containerStyle?: ViewStyle;
}

export default function CategoryChips({ options, value, onChange, containerStyle }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, containerStyle]}
      contentContainerStyle={styles.content}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { maxHeight: 52, flexGrow: 0 },
  content: { paddingHorizontal: 12, paddingVertical: 8, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  chipActive: { backgroundColor: '#C84B1A', borderColor: '#C84B1A' },
  chipText: { fontSize: 13, color: '#6B5B4A', fontWeight: '500', fontFamily: fonts.bodyMedium },
  chipTextActive: { color: '#FFF', fontWeight: '700', fontFamily: fonts.bodyBold },
});

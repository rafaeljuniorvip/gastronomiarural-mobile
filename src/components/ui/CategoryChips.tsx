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
  // altura fixa evita colapso quando a SectionList abaixo re-renderiza
  scroll: { height: 56, flexGrow: 0, flexShrink: 0 },
  content: { paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' },
  chip: {
    marginRight: 8,
    height: 36,
    minWidth: 60,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  chipActive: { backgroundColor: '#C84B1A', borderColor: '#C84B1A' },
  // Inclui fonte de sistema como fallback caso a custom não tenha carregado;
  // lineHeight explícito garante que o glyph seja renderizado mesmo em
  // re-renders pesados (sintoma: texto sumia quando a lista abaixo tinha muitos itens).
  chipText: {
    fontSize: 13,
    lineHeight: 16,
    color: '#6B5B4A',
    fontWeight: '500',
    fontFamily: fonts.bodyMedium,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: '700',
    fontFamily: fonts.bodyBold,
  },
});

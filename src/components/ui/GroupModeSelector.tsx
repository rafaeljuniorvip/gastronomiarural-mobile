import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { fonts } from '../../theme/fonts';

export type GroupMode = 'categoria' | 'setor';

interface Props {
  value: GroupMode;
  onChange: (mode: GroupMode) => void;
}

export default function GroupModeSelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      {[
        { key: 'categoria' as const, label: 'Categoria', icon: 'tag-multiple' },
        { key: 'setor' as const, label: 'Setor', icon: 'map-marker-radius' },
      ].map((opt) => (
        <TouchableOpacity
          key={opt.key}
          onPress={() => onChange(opt.key)}
          style={[styles.btn, value === opt.key && styles.btnActive]}
        >
          <Icon name={opt.icon as any} size={14} color={value === opt.key ? '#FFF' : '#6B1E1E'} />
          <Text style={[styles.text, value === opt.key && styles.textActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#F2EBE0', padding: 3, borderRadius: 8, margin: 12, alignSelf: 'flex-start', gap: 2 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnActive: { backgroundColor: '#6B1E1E' },
  text: { fontSize: 13, fontWeight: '600', color: '#6B1E1E', fontFamily: fonts.bodyMedium },
  textActive: { color: '#FFF', fontFamily: fonts.bodyBold },
});

import { useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface Props {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  onSubmit?: (text: string) => void;
  containerStyle?: ViewStyle;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar…',
  debounceMs = 300,
  autoFocus = false,
  onSubmit,
  containerStyle,
}: Props) {
  const [text, setText] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // sincroniza quando o valor externo muda (ex.: limpar de fora)
  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleChange(next: string) {
    setText(next);
    if (timer.current) clearTimeout(timer.current);
    if (debounceMs <= 0) {
      onChange(next);
      return;
    }
    timer.current = setTimeout(() => onChange(next), debounceMs);
  }

  function handleClear() {
    if (timer.current) clearTimeout(timer.current);
    setText('');
    onChange('');
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Icon name="magnify" size={20} color="#6B6B6B" style={styles.leadingIcon} />
      <TextInput
        value={text}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor="#9A9A9A"
        style={styles.input}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={() => {
          if (timer.current) clearTimeout(timer.current);
          onChange(text);
          onSubmit?.(text);
        }}
      />
      {text.length > 0 ? (
        <TouchableOpacity onPress={handleClear} hitSlop={10} style={styles.clearBtn}>
          <Icon name="close-circle" size={18} color="#9A9A9A" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    paddingHorizontal: 10,
    marginHorizontal: 12,
    marginVertical: 8,
    height: 40,
  },
  leadingIcon: { marginRight: 6 },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#2B2B2B',
    paddingVertical: 0,
  },
  clearBtn: { padding: 2, marginLeft: 4 },
});

import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../theme';

export default function SaveBar({
  onPress,
  disabled = false,
  label = 'Save',
}: {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
}) {
  const inset = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: inset.bottom || 10 }]}>
      <TouchableOpacity
        style={[styles.btn, disabled && { opacity: 0.45 }]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={styles.txt}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  btn: {
    width: '95%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow,
  },
  txt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

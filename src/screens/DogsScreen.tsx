import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getDogs, deleteDog } from '../db';
import type { Dog } from '../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dogs'>;

export default function DogsScreen() {
  const navigation = useNavigation<Nav>();
  const [dogs, setDogs] = useState<Dog[]>([]);

  const load = useCallback(() => {
    let active = true;
    (async () => {
      try {
        const data = await getDogs();
        if (active) setDogs(data);
      } catch (e) { console.warn('Failed to load dogs', e); }
    })();
    return () => { active = false; };
  }, []);

  useFocusEffect(load);

  const onDelete = (id?: number) => {
    if (!id) return;
    Alert.alert('Delete', 'Are you sure you want to delete this dog?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteDog(id);
        const data = await getDogs();
        setDogs(data);
      } }
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {dogs.length === 0 && (
        <View style={styles.empty}><Text>No dogs yet. Tap “+” to add.</Text></View>
      )}

      <FlatList
        data={dogs}
        keyExtractor={(d) => String(d.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DogForm', { dog: item })}>
            {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.avatar} /> : <View style={[styles.avatar, styles.noImg]} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name} {item.sex ? `(${item.sex})` : ''}</Text>
              {!!item.breed && <Text style={styles.sub}>{item.breed}</Text>}
              {!!item.birthdate && <Text style={styles.sub}>b. {item.birthdate}</Text>}
            </View>
            <TouchableOpacity onPress={() => onDelete(item.id)}><Text style={styles.delete}>Delete</Text></TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddHub')}>
        <Text style={styles.fabLabel}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, elevation: 1 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee' },
  noImg: { borderWidth: 1, borderColor: '#ddd' },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { color: '#555', marginTop: 2 },
  delete: { color: '#b00020', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#1e88e5', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  fabLabel: { color: 'white', fontSize: 28, lineHeight: 28, fontWeight: '700' }
});

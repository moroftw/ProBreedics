import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getDogById, deleteDog } from '../db';
import type { Dog } from '../types';
import { colors, radius, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DogMenu'>;

export default function DogMenuScreen({ route, navigation }: Props) {
  const dogId = (route.params as any).dogId as number;

  const [dog, setDog] = useState<Dog | null>(null);

  useEffect(() => {
    (async () => {
      const d = await getDogById(dogId);
      if (d) {
        setDog(d);
        navigation.setOptions({ title: d.name });
      }
    })();
  }, [dogId, navigation]);

  const confirmDelete = () =>
    Alert.alert('Delete dog', `Remove “${dog?.name}”?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteDog(dogId);
          navigation.goBack();
        } },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Breeding profile */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DogForm', { dog })}
      >
        <MaterialCommunityIcons name="dog" size={48} color={colors.primary} />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Breeding profile</Text>
          <Text style={styles.cardDesc}>Edit pedigree & core info.</Text>
        </View>
      </TouchableOpacity>

      {/* Genetics list */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GeneticsList', { dogId, dogName: dog?.name })}
      >
        <MaterialCommunityIcons name="dna" size={48} color={colors.primary} />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Genetics</Text>
          <Text style={styles.cardDesc}>Add DNA tests & view results.</Text>
        </View>
      </TouchableOpacity>

      {/* Veterinary list */}
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('VetRecordsList', { dogId, dogName: dog?.name })
        }
      >
        <MaterialCommunityIcons name="stethoscope" size={48} color={colors.primary} />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Veterinary</Text>
          <Text style={styles.cardDesc}>Vaccines, exams, surgeries.</Text>
        </View>
      </TouchableOpacity>

      {/* Delete dog */}
      <TouchableOpacity style={[styles.card, styles.deleteCard]} onPress={confirmDelete}>
        <MaterialCommunityIcons name="trash-can-outline" size={48} color="#b00020" />
        <View style={styles.textBox}>
          <Text style={[styles.cardTitle, { color: '#b00020' }]}>Remove dog</Text>
          <Text style={styles.cardDesc}>Delete this dog and all records.</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  card: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: 16,
    ...shadow,
  },
  deleteCard: { borderWidth: 1, borderColor: '#b00020' },
  textBox: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  cardDesc: { color: '#555' },
});

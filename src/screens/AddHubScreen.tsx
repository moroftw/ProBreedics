import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RootStackParamList } from '../../App';
import { getDogs } from '../db';
import type { Dog } from '../types';
import { colors, radius, shadow } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddHub'>;

export default function AddHubScreen() {
  const navigation = useNavigation<Nav>();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selected, setSelected] = useState<number | undefined>();

  useEffect(() => { (async () => setDogs(await getDogs()))(); }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>What would you like to add?</Text>

      {dogs.length > 0 && (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.subHeader}>Dog</Text>
          <View style={styles.chips}>
            {dogs.map(d => (
              <TouchableOpacity key={d.id} onPress={() => setSelected(d.id!)}
                style={[styles.chip, selected===d.id && styles.chipActive]}>
                <Text style={[styles.chipTxt, selected===d.id && styles.chipTxtActive]} numberOfLines={1}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selected && <Text style={styles.selectedHint}>Selected: {dogs.find(d=>d.id===selected)?.name}</Text>}
        </View>
      )}

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('DogForm')}>
        <MaterialCommunityIcons name="dog" size={48} color={colors.primary} />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Breeding profile</Text>
          <Text style={styles.cardDesc}>Create / edit a dog profile.</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => selected && navigation.navigate('GeneticsForm', { dogId: selected })}>
        <MaterialCommunityIcons name="dna" size={48} color={colors.primary} />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Genetics</Text>
          <Text style={styles.cardDesc}>Add DNA tests (select dog first).</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => selected && navigation.navigate('VetRecordForm', { dogId: selected })}>
        <MaterialCommunityIcons name="stethoscope" size={48} color={colors.primary} />
        <View style={styles.textBox}>
          <Text style={styles.cardTitle}>Veterinary</Text>
          <Text style={styles.cardDesc}>Add vet record (select dog first).</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { padding:16, gap:14 },
  header:      { fontSize:22, fontWeight:'700', color: colors.text },
  subHeader:   { fontWeight:'600', marginBottom:8, color: colors.text },
  chips:       { flexDirection:'row', gap:8, flexWrap:'wrap' },
  chip:        { borderWidth:1, borderColor:'#bbb', borderRadius:20, paddingVertical:8, paddingHorizontal:12, backgroundColor:'#fff' },
  chipActive:  { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt:     { color:'#333' },   chipTxtActive:{ color:'#fff', fontWeight:'600' },
  selectedHint:{ marginTop:6, color:'#555' },

  card:{ flexDirection:'row', gap:16, alignItems:'center',
         backgroundColor: colors.card, borderRadius: radius, padding:16, ...shadow },
  textBox:{ flex:1 },
  cardTitle:{ fontSize:18, fontWeight:'700', color: colors.text },
  cardDesc:{ color:'#555' }
});

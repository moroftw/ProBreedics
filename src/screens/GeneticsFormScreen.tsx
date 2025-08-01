import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getDogs, insertGeneticTest } from '../db';
import type { Dog, GeneticTest } from '../types';
import SaveBar from '../components/SaveBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { maskYYYYMMDD, isFullValid } from '../utils/dateMask';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GeneticsForm'>;

export default function GeneticsFormScreen({ route, navigation }: Props) {
  const presetDogId = (route.params as any)?.dogId as number | undefined;

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [dogId, setDogId] = useState<number | undefined>(presetDogId);
  const [testName, setTestName] = useState('');
  const [result, setResult] = useState('');
  const [lab, setLab] = useState('');
  const [date, setDate] = useState('');
  const [dateErr, setDateErr] = useState('');
  const [notes, setNotes] = useState('');

  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 74;

  useEffect(() => {
    navigation.setOptions({ title: 'Add Genetic Test' });
    (async () => {
      const list = await getDogs();
      setDogs(list);
      if (!presetDogId && list.length > 0) setDogId(list[0].id);
    })();
  }, [presetDogId, navigation]);

  const valid = !!dogId && !!testName.trim();

  const onSave = async () => {
    if (!valid) { Alert.alert('Dog & test name required'); return; }
    if (date && !isFullValid(date)) { Alert.alert('Date must be YYYY-MM-DD'); return; }
    const payload: GeneticTest = { dogId: dogId!, testName: testName.trim(), result, lab, date, notes };
    try { await insertGeneticTest(payload); navigation.goBack(); }
    catch { Alert.alert('Error', 'Cannot save'); }
  };

  const Chip = ({ d }: { d: Dog }) => (
    <TouchableOpacity key={d.id} onPress={() => setDogId(d.id!)}
      style={[styles.chip, dogId===d.id && styles.chipActive]}>
      <Text style={[styles.chipTxt, dogId===d.id && styles.chipTxtActive]} numberOfLines={1}>{d.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1 }}>
      <ScrollView contentContainerStyle={[styles.container,{ paddingBottom: padBottom }]}>
        {/* selector Dog apare doar dacă nu vii deja cu dogId */}
        {!presetDogId && (
          <>
            <Text style={styles.label}>Dog *</Text>
            <View style={styles.row}>{dogs.map(d => <Chip key={d.id} d={d} />)}</View>
          </>
        )}

        <Text style={styles.label}>Test name *</Text>
        <TextInput style={styles.input} value={testName} onChangeText={setTestName} placeholder="e.g., MDR1" />

        <Text style={styles.label}>Result</Text>
        <TextInput style={styles.input} value={result} onChangeText={setResult} placeholder="Clear / Carrier / Affected" />

        <Text style={styles.label}>Lab</Text>
        <TextInput style={styles.input} value={lab} onChangeText={setLab} placeholder="e.g., Embark" />

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={[styles.input, !!dateErr && { borderColor:'#b00020' }]}
          value={date} placeholder="YYYY-MM-DD" keyboardType="number-pad" maxLength={10}
          onChangeText={(t)=>{ const {value,error}=maskYYYYMMDD(t); setDate(value); setDateErr(error); }}
        />
        {!!dateErr && <Text style={styles.err}>{dateErr}</Text>}

        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input,{height:90}]} value={notes} onChangeText={setNotes} placeholder="observations" multiline />
      </ScrollView>

      <SaveBar onPress={onSave} disabled={!valid} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ padding:16, gap:10 },
  label:{ fontWeight:'600', marginTop:6 },
  input:{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:10, backgroundColor:'#fff' },
  err:{ color:'#b00020', fontSize:12, marginTop:4 },
  row:{ flexDirection:'row', gap:8, flexWrap:'wrap' },
  chip:{ borderWidth:1, borderColor:'#bbb', borderRadius:20, paddingVertical:8, paddingHorizontal:12, backgroundColor:'#fff' },
  chipActive:{ backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt:{ color:'#333' }, chipTxtActive:{ color:'#fff', fontWeight:'600' }
});

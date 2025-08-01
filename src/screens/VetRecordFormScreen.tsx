import { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getDogs, insertVetRecord } from '../db';
import type { Dog, VetRecord, VetType } from '../types';
import SaveBar from '../components/SaveBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { maskYYYYMMDD, isFullValid } from '../utils/dateMask';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'VetRecordForm'>;
const TYPES: VetType[] = ['VACCINATION','DEWORMING','EXAM','SURGERY','OTHER'];

export default function VetRecordFormScreen({ route, navigation }: Props) {
  const presetDogId = (route.params as any)?.dogId as number | undefined;

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [dogId, setDogId] = useState<number | undefined>(presetDogId);
  const [type, setType] = useState<VetType>('EXAM');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');           const [dateErr, setDateErr] = useState('');
  const [nextDue, setNextDue] = useState('');     const [nextErr, setNextErr] = useState('');
  const [notes, setNotes] = useState('');

  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 74;

  useEffect(() => {
    navigation.setOptions({ title: 'Add Veterinary Record' });
    (async () => {
      const list = await getDogs();
      setDogs(list);
      if (!presetDogId && list.length>0) setDogId(list[0].id);
    })();
  }, [presetDogId, navigation]);

  const valid = useMemo(() => !!dogId && !!title.trim() && !!date, [dogId,title,date]);

  const onSave = async () => {
    if (!valid) { Alert.alert('Required fields missing'); return; }
    if (!isFullValid(date)) { Alert.alert('Date invalid'); return; }
    if (nextDue && !isFullValid(nextDue)) { Alert.alert('Next due date invalid'); return; }
    const payload: VetRecord = { dogId: dogId!, type, title: title.trim(), date, nextDueDate: nextDue, notes };
    try { await insertVetRecord(payload); navigation.goBack(); } catch { Alert.alert('Error', 'Cannot save'); }
  };

  const Chip = ({ label, sel, onSel }:{ label:string; sel:boolean; onSel:()=>void })=>(
    <TouchableOpacity onPress={onSel} style={[styles.chip, sel&&styles.chipActive]}>
      <Text style={[styles.chipTxt, sel&&styles.chipTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1 }}>
      <ScrollView contentContainerStyle={[styles.container,{ paddingBottom: padBottom }]}>
        {/* selector Dog doar dacă nu vii deja din DogMenu */}
        {!presetDogId && (
          <>
            <Text style={styles.label}>Dog *</Text>
            <View style={styles.row}>
              {dogs.map(d=>(
                <Chip key={d.id} label={d.name} sel={dogId===d.id} onSel={()=>setDogId(d.id!)} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Type *</Text>
        <View style={styles.row}>
          {TYPES.map(t=>(
            <Chip key={t} label={t} sel={type===t} onSel={()=>setType(t)} />
          ))}
        </View>

        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g., Rabies vaccine" />

        <Text style={styles.label}>Date *</Text>
        <TextInput
          style={[styles.input, !!dateErr && { borderColor:'#b00020' }]}
          value={date} placeholder="YYYY-MM-DD" keyboardType="number-pad" maxLength={10}
          onChangeText={t=>{ const {value,error}=maskYYYYMMDD(t); setDate(value); setDateErr(error); }}
        />
        {!!dateErr && <Text style={styles.err}>{dateErr}</Text>}

        <Text style={styles.label}>Next due date</Text>
        <TextInput
          style={[styles.input, !!nextErr && { borderColor:'#b00020' }]}
          value={nextDue} placeholder="YYYY-MM-DD (optional)" keyboardType="number-pad" maxLength={10}
          onChangeText={t=>{ const {value,error}=maskYYYYMMDD(t); setNextDue(value); setNextErr(error); }}
        />
        {!!nextErr && <Text style={styles.err}>{nextErr}</Text>}

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

import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDogs, insertMating, updateMating, deleteMating } from '../db';
import type { Dog, Mating } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import SaveBar from '../components/SaveBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MatingForm'>;

export default function MatingFormScreen({ route, navigation }: Props) {
  /**  ←–––––––––––––––––––––––––––––––––––––––––––––
   *  AICI NE LUĂM PARAMETRUL EXACT
   *  Dacă ai navigat cu   navigate('MatingForm', { mating: item })
   *  atunci îl găsim în route.params?.mating
   *  ––––––––––––––––––––––––––––––––––––––––––––*/
  const editing = route.params?.mating as Mating | undefined;

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [maleId, setMaleId]     = useState<number | undefined>(editing?.maleDogId);
  const [femaleId, setFemaleId] = useState<number | undefined>(editing?.femaleDogId);
  const [date, setDate]         = useState(editing?.date ?? new Date().toISOString().slice(0,10));
  const [showPicker, setShowPicker] = useState(false);

  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 74;

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit Mating' : 'Add Mating' });
    (async () => setDogs(await getDogs()))();
  }, [editing, navigation]);

  const valid = useMemo(() => !!maleId && !!femaleId && !!date, [maleId, femaleId, date]);

  const onSave = async () => {
    if (!valid) return;
    const payload: Mating = { maleDogId: maleId!, femaleDogId: femaleId!, date };
    try {
      editing?.id ? await updateMating(editing.id, payload)
                  : await insertMating(payload);
      navigation.goBack();
    } catch { Alert.alert('Error', 'Cannot save'); }
  };

  const askDelete = () => {
    if (!editing?.id) return;
    Alert.alert('Delete mating', 'Are you sure?', [
      { text:'Cancel', style:'cancel' },
      { text:'Delete', style:'destructive', onPress: async()=>{ await deleteMating(editing.id!); navigation.goBack(); } }
    ]);
  };

  const Chip = ({ id, sel, label, onSel }:{
    id:number; sel:boolean; label:string; onSel:(id:number)=>void;
  }) => (
    <TouchableOpacity onPress={()=>onSel(id)} style={[styles.chip, sel&&styles.chipActive]}>
      <Text style={[styles.chipTxt, sel&&styles.chipTxtActive]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1 }}>
      <ScrollView contentContainerStyle={[styles.container,{paddingBottom: padBottom}]}>
        <Text style={styles.label}>Male *</Text>
        <View style={styles.row}>
          {dogs.map(d=> <Chip key={d.id} id={d.id!} label={d.name} sel={maleId===d.id} onSel={setMaleId} />)}
        </View>

        <Text style={styles.label}>Female *</Text>
        <View style={styles.row}>
          {dogs.map(d=> <Chip key={d.id} id={d.id!} label={d.name} sel={femaleId===d.id} onSel={setFemaleId} />)}
        </View>

        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity onPress={()=>setShowPicker(true)} style={styles.dateBox}>
          <Text>{date}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            mode="date"
            value={new Date(date)}
            onChange={(_,d)=>{ setShowPicker(false); d && setDate(d.toISOString().slice(0,10)); }}
          />
        )}

        {/* BUTON DELETE – apare doar când avem editing.id */}
        {editing?.id && (
          <TouchableOpacity style={styles.delBtn} onPress={askDelete}>
            <Text style={styles.delTxt}>Delete mating</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <SaveBar onPress={onSave} disabled={!valid} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ padding:16, gap:12 },
  label:{ fontWeight:'600', marginTop:6 },
  row:{ flexDirection:'row', gap:8, flexWrap:'wrap' },

  chip:{ borderWidth:1, borderColor:'#bbb', borderRadius:20, paddingVertical:8, paddingHorizontal:12, backgroundColor:'#fff' },
  chipActive:{ backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt:{ color:'#333' }, chipTxtActive:{ color:'#fff', fontWeight:'600' },

  dateBox:{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:10, backgroundColor:'#fff', width:140, alignItems:'center' },

  delBtn:{ marginTop:24, alignSelf:'center', backgroundColor:'#fff', borderRadius:12, paddingVertical:12, paddingHorizontal:24, borderWidth:1, borderColor:'#b00020', ...shadow },
  delTxt:{ color:'#b00020', fontWeight:'700' }
});

import { useEffect, useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveToAppDir } from '../utils/imageStore';            // ← nou
import { insertDog, updateDog } from '../db';
import type { Dog, Sex } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import SaveBar from '../components/SaveBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { maskYYYYMMDD, isFullValid } from '../utils/dateMask';

type Props = NativeStackScreenProps<RootStackParamList, 'DogForm'>;

export default function DogFormScreen({ route, navigation }: Props) {
  const editingDog = (route.params?.dog as Dog) || null;

  const [name, setName] = useState(editingDog?.name || '');
  const [sex, setSex] = useState<Sex>(editingDog?.sex || 'M');
  const [breed, setBreed] = useState(editingDog?.breed || '');
  const [birthdate, setBirthdate] = useState(editingDog?.birthdate || '');
  const [birthErr, setBirthErr] = useState('');
  const [color, setColor] = useState(editingDog?.color || '');
  const [microchip, setMicrochip] = useState(editingDog?.microchip || '');
  const [notes, setNotes] = useState(editingDog?.notes || '');
  const [imageUri, setImageUri] = useState(editingDog?.imageUri || '');

  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 74;

  useEffect(() => navigation.setOptions({ title: editingDog ? 'Edit Dog' : 'Add Dog' }), [editingDog, navigation]);

  /** pick & copy into app sandbox */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission denied'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });
    if (!res.canceled) {
      const localUri = await saveToAppDir(res.assets[0].uri);   // ← copie permanentă
      setImageUri(localUri);
    }
  };

  const onSave = async () => {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    if (birthdate && !isFullValid(birthdate)) { Alert.alert('Birthdate invalid'); return; }
    const payload: Dog = { name: name.trim(), sex, breed, birthdate, color, microchip, notes, imageUri };
    try { editingDog?.id ? await updateDog(editingDog.id, payload) : await insertDog(payload); navigation.goBack(); }
    catch { Alert.alert('Error', 'Cannot save'); }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: padBottom }]}>
        <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : <Text style={{ color: '#1e88e5' }}>Add photo</Text>}
        </TouchableOpacity>

        <Text style={styles.label}>Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g., Asha" />

        <Text style={styles.label}>Sex *</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setSex('M')} style={[styles.chip, sex==='M' && styles.chipActive]}><Text style={[styles.chipTxt, sex==='M' && styles.chipTxtActive]}>Male</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setSex('F')} style={[styles.chip, sex==='F' && styles.chipActive]}><Text style={[styles.chipTxt, sex==='F' && styles.chipTxtActive]}>Female</Text></TouchableOpacity>
        </View>

        <Text style={styles.label}>Breed</Text>
        <TextInput style={styles.input} value={breed} onChangeText={setBreed} placeholder="e.g., Labrador" />

        <Text style={styles.label}>Birthdate</Text>
        <TextInput
          style={[styles.input, !!birthErr && { borderColor: '#b00020' }]}
          value={birthdate}
          placeholder="YYYY-MM-DD"
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={(t) => {
            const { value, error } = maskYYYYMMDD(t);
            setBirthdate(value); setBirthErr(error);
          }}
        />
        {!!birthErr && <Text style={styles.err}>{birthErr}</Text>}

        <Text style={styles.label}>Color</Text>
        <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="e.g., black" />

        <Text style={styles.label}>Microchip</Text>
        <TextInput style={styles.input} value={microchip} onChangeText={setMicrochip} placeholder="e.g., 642..." />

        <Text style={styles.label}>Notes</Text>
        <TextInput style={[styles.input, { height: 90 }]} value={notes} onChangeText={setNotes} placeholder="observations" multiline />
      </ScrollView>

      <SaveBar onPress={onSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ padding:16, gap:10 },
  label:{ fontWeight:'600', marginTop:6 },
  input:{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:10, backgroundColor:'#fff' },
  err:{ color:'#b00020', fontSize:12, marginTop:4 },
  row:{ flexDirection:'row', gap:10 },
  chip:{ borderWidth:1, borderColor:'#bbb', borderRadius:20, paddingVertical:8, paddingHorizontal:12, backgroundColor:'#fff' },
  chipActive:{ backgroundColor:'#1e88e5' }, chipTxt:{ color:'#333' }, chipTxtActive:{ color:'#fff', fontWeight:'600' },
  imageBtn:{ alignSelf:'center', width:120, height:120, borderRadius:60, borderWidth:1, borderColor:'#ddd', alignItems:'center', justifyContent:'center', marginBottom:10, overflow:'hidden' },
  image:{ width:'100%', height:'100%' }
});

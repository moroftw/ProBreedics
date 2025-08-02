import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveToAppDir } from '../utils/imageStore';
import { insertDog } from '../db';
import type { Dog, Sex } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import SaveBar from '../components/SaveBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QuickAddDog'>;

export default function QuickAddDogScreen({ navigation }: Props) {
  const [nickname, setNickname] = useState('');
  const [sex, setSex]   = useState<Sex>('M');
  const [imageUri, setImageUri] = useState('');
  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 74;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission denied'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
    if (!res.canceled) {
      const localUri = await saveToAppDir(res.assets[0].uri);
      setImageUri(localUri);
    }
  };

  const onSave = async () => {
    if (!nickname.trim()) { Alert.alert('Nickname required'); return; }
    const payload: Dog = { name: nickname.trim(), sex, imageUri };
    try { await insertDog(payload); navigation.goBack(); }
    catch { Alert.alert('Error', 'Cannot save'); }
  };

  return (
    <View style={{ flex:1 }}>
      <ScrollView contentContainerStyle={[styles.container,{paddingBottom:padBottom}]}>
        <Text style={styles.title}>Add Dog</Text>

        <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : <Text style={{ color: colors.primary }}>Add photo</Text>}
        </TouchableOpacity>

        <Text style={styles.label}>Nickname *</Text>
        <TextInput style={styles.input} value={nickname} onChangeText={setNickname} placeholder="e.g., Spike" />

        <Text style={styles.label}>Sex *</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setSex('M')} style={[styles.chip, sex==='M'&&styles.chipActive(colors.primary)]}>
            <Text style={[styles.chipTxt, sex==='M'&&{color:'#fff'}]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSex('F')} style={[styles.chip, sex==='F'&&styles.chipActive(colors.female)]}>
            <Text style={[styles.chipTxt, sex==='F'&&{color:'#fff'}]}>Female</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SaveBar onPress={onSave} disabled={!nickname.trim()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ padding:16, gap:12 },
  title:{ fontSize:20, fontWeight:'700', marginBottom:6 },
  label:{ fontWeight:'600', marginTop:6 },
  input:{ borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:10, backgroundColor:'#fff' },
  row:{ flexDirection:'row', gap:10 },
  chip:{ borderWidth:1, borderColor:'#bbb', borderRadius:20, paddingVertical:8, paddingHorizontal:12, backgroundColor:'#fff' },
  chipActive:(bg:string)=>({ backgroundColor:bg, borderColor:bg }),
  chipTxt:{ color:'#333' },
  imageBtn:{ alignSelf:'flex-start', width:110, height:110, borderRadius:radius, borderWidth:1, borderColor:'#ddd', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  image:{ width:'100%', height:'100%' }
});
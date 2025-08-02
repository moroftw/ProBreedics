import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveToAppDir } from '../utils/imageStore';
import { insertDog, updateDog } from '../db';
import type { Dog, Sex } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import SaveBar from '../components/SaveBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { maskYYYYMMDD, isFullValid } from '../utils/dateMask';
import breedsData from '../assets/data/breeds.json';
import { Searchbar, Modal, Portal, Provider, Text as PaperText } from 'react-native-paper';

type Props = NativeStackScreenProps<RootStackParamList, 'DogForm'>;

export default function DogFormScreen({ route, navigation }: Props) {
  const editingDog = (route.params?.dog as Dog) || null;

  const [name, setName] = useState(editingDog?.registeredName ?? '');
  const [nickname, setNickname] = useState(editingDog?.name ?? '');
  const [sex, setSex] = useState<Sex>(editingDog?.sex ?? 'M');
  const [breed, setBreed] = useState(editingDog?.breed ?? '');
  const [birthdate, setBirthdate] = useState(editingDog?.birthdate ?? '');
  const [birthErr, setBirthErr] = useState('');
  const [color, setColor] = useState(editingDog?.color ?? '');
  const [microchip, setMicrochip] = useState(editingDog?.microchip ?? '');
  const [notes, setNotes] = useState(editingDog?.notes ?? '');
  const [imageUri, setImageUri] = useState(editingDog?.imageUri ?? '');

  const [breedSearch, setBreedSearch] = useState('');
  const [colorSearch, setColorSearch] = useState('');
  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 74;

  useEffect(() => {
    navigation.setOptions({ title: editingDog ? 'Edit Dog' : 'Add Dog' });
  }, [editingDog, navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });
    if (!res.canceled) {
      const localUri = await saveToAppDir(res.assets[0].uri);
      setImageUri(localUri);
    }
  };

  const onSave = async () => {
    if (!nickname.trim()) { Alert.alert('Nickname required'); return; }
    if (birthdate && !isFullValid(birthdate)) { Alert.alert('Birthdate invalid'); return; }

    const payload: Dog = {
      name: nickname.trim(),
      sex,
      breed,
      birthdate,
      color,
      microchip,
      notes,
      imageUri,
      registeredName: name.trim(),
    };

    try {
      editingDog?.id
        ? await updateDog(editingDog.id, payload)
        : await insertDog(payload);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Cannot save');
    }
  };

  const breedOptions = Object.keys(breedsData).filter(b =>
    b.toLowerCase().includes(breedSearch.toLowerCase())
  );

  const colorOptions = breedsData[breed] || [];
  const filteredColors = colorOptions.filter(c =>
    c.toLowerCase().includes(colorSearch.toLowerCase())
  );

  return (
    <Provider>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: padBottom }]}>
          <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Text style={{ color: '#1e88e5' }}>Add photo</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Dog's official name"
          />

          <Text style={styles.label}>Nickname *</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="e.g., Asha"
          />

          <Text style={styles.label}>Sex *</Text>
          <View style={styles.row}>
            <TouchableOpacity onPress={() => setSex('M')} style={[styles.chip, sex === 'M' && styles.chipActive]}>
              <Text style={[styles.chipTxt, sex === 'M' && styles.chipTxtActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSex('F')} style={[styles.chip, sex === 'F' && styles.chipActive]}>
              <Text style={[styles.chipTxt, sex === 'F' && styles.chipTxtActive]}>Female</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Breed</Text>
          <TouchableOpacity style={styles.input} onPress={() => setBreedModalVisible(true)}>
            <Text>{breed || 'Select a breed'}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Birthdate</Text>
          <TextInput
            style={[styles.input, !!birthErr && { borderColor: '#b00020' }]}
            value={birthdate}
            placeholder="YYYY-MM-DD"
            keyboardType="number-pad"
            maxLength={10}
            onChangeText={(t) => {
              const { value, error } = maskYYYYMMDD(t);
              setBirthdate(value);
              setBirthErr(error);
            }}
          />
          {!!birthErr && <Text style={styles.err}>{birthErr}</Text>}

          <Text style={styles.label}>Color</Text>
          <TouchableOpacity style={styles.input} onPress={() => setColorModalVisible(true)}>
            <Text>{color || 'Select a color'}</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Microchip</Text>
          <TextInput style={styles.input} value={microchip} onChangeText={setMicrochip} placeholder="e.g., 642..." />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { height: 90 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="observations"
            multiline
          />
        </ScrollView>

        <SaveBar onPress={onSave} />
      </View>

      {/* Breed Modal */}
      <Portal>
        <Modal visible={breedModalVisible} onDismiss={() => setBreedModalVisible(false)} contentContainerStyle={styles.modal}>
          <Searchbar placeholder="Search breed..." value={breedSearch} onChangeText={setBreedSearch} />
          <ScrollView style={{ maxHeight: 250 }}>
            {breedOptions.map((item) => (
              <TouchableOpacity key={item} onPress={() => { setBreed(item); setBreedModalVisible(false); setBreedSearch(''); }}>
                <PaperText style={styles.option}>{item}</PaperText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>
      </Portal>

      {/* Color Modal */}
      <Portal>
        <Modal visible={colorModalVisible} onDismiss={() => setColorModalVisible(false)} contentContainerStyle={styles.modal}>
          <Searchbar placeholder="Search color..." value={colorSearch} onChangeText={setColorSearch} />
          <ScrollView style={{ maxHeight: 250 }}>
            {filteredColors.map((item) => (
              <TouchableOpacity key={item} onPress={() => { setColor(item); setColorModalVisible(false); setColorSearch(''); }}>
                <PaperText style={styles.option}>{item}</PaperText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  label: { fontWeight: '600', marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff'
  },
  err: { color: '#b00020', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff'
  },
  chipActive: { backgroundColor: '#1e88e5' },
  chipTxt: { color: '#333' },
  chipTxtActive: { color: '#fff', fontWeight: '600' },
  imageBtn: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden'
  },
  image: { width: '100%', height: '100%' },
  modal: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%'
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
    color: '#222'
  }
});
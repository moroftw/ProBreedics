import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getDogs } from '../db';
import type { Dog } from '../types';
import { colors, radius, shadow } from '../theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NUM = 3, GAP = 12, PAD = 12, W = Dimensions.get('window').width;
const SIZE = Math.floor((W - PAD * 2 - GAP * (NUM - 1)) / NUM);

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dogs'>;

export default function DogsGridScreen() {
  const navigation = useNavigation<Nav>();
  const [dogs, setDogs] = useState<Dog[]>([]);

  const load = useCallback(() => {
    let active = true;
    (async () => { const list = await getDogs(); if (active) setDogs(list); })();
    return () => { active = false; };
  }, []);
  useFocusEffect(load);

  const data = useMemo(() => [...dogs, { id: -1, name: '+', sex: 'M' } as any], [dogs]);

  const renderItem = ({ item, index }: { item: Dog & { id: number }; index: number }) => {
    const fade = new Animated.Value(0);
    Animated.timing(fade, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }).start();

    const isAdd = item.id === -1;
    const borderColor = item.sex === 'F' ? colors.female : colors.primary;

    return (
      <Animated.View style={{ opacity: fade }}>
        <Pressable
          style={{ alignItems: 'center' }}
          onPress={() => isAdd
            ? navigation.navigate('QuickAddDog')
            : navigation.navigate('DogMenu', { dogId: item.id, dogName: item.name })
          }
        >
          <View
            style={[
              styles.box,
              { width: SIZE, height: SIZE },
              isAdd
                ? styles.addBox
                : { borderColor, borderWidth: 3 },
            ]}
          >
            {isAdd ? (
              <MaterialCommunityIcons name="plus" size={40} color="#9e9e9e" />
            ) : item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.img} />
            ) : (
              <View style={styles.placeholder}><Text style={styles.init}>{item.name[0]}</Text></View>
            )}
          </View>
          {!isAdd && <Text numberOfLines={1} style={styles.name}>{item.name}</Text>}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(it, i) => String((it as any).id ?? i)}
        numColumns={NUM}
        columnWrapperStyle={{ gap: GAP, paddingHorizontal: PAD }}
        contentContainerStyle={{ gap: GAP, paddingBottom: 16, paddingTop: 12 }}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: radius, ...shadow, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  addBox:{ backgroundColor:'#f0f0f0', borderWidth:0 },
  img: { width:'100%', height:'100%' },
  placeholder:{ flex:1, alignSelf:'stretch', alignItems:'center', justifyContent:'center', backgroundColor: colors.background },
  init: { fontSize: 28, fontWeight: '700', color: colors.primary },
  name: { marginTop: 6, fontSize: 12, color: colors.text }
});

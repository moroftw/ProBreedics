import { useCallback, useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getMatings, getDogs, type Mating } from '../db';
import { colors, radius, shadow } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Matings'>;

const WIDTH = Dimensions.get('window').width - 24 * 2;  // card width
const IMG   = 64;

interface Card extends Mating {
  maleName?: string;   femaleName?: string;
  maleImageUri?: string; femaleImageUri?: string;
  maleSex?: 'M'|'F';     femaleSex?: 'M'|'F';
  isAdd?: boolean;
}

export default function MatingsScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<Card[]>([]);

  /* -- load matings + dogs, map info -- */
  const load = useCallback(() => {
    let active = true;
    (async () => {
      const [matings, dogs] = await Promise.all([getMatings(), getDogs()]);
      const map = Object.fromEntries(dogs.map(d => [d.id!, d]));
      const cards: Card[] = matings.map(m => ({
        ...m,
        maleName:       map[m.maleDogId!]?.name,
        femaleName:     map[m.femaleDogId!]?.name,
        maleImageUri:   map[m.maleDogId!]?.imageUri,
        femaleImageUri: map[m.femaleDogId!]?.imageUri,
        maleSex:        map[m.maleDogId!]?.sex,
        femaleSex:      map[m.femaleDogId!]?.sex,
      }));
      if (active) setItems(cards);
    })();
    return () => { active = false; };
  }, []);
  useFocusEffect(load);

  /* bară progres */
  const today = useMemo(() => new Date(), []);
  const barData = (dateStr: string) => {
    const mateDate = new Date(dateStr);
    const gone = Math.min(Math.max(Math.floor((+today - +mateDate) / 86400000), 0), 63);
    return { gone, pct: (gone / 63) * 100 };
  };

  const data = useMemo<Card[]>(() => [...items, { id: -1, isAdd: true } as any], [items]);

  /* imagine cu border pe sex */
  const Img = ({ uri, name, sex }: { uri?: string; name?: string; sex?: 'M'|'F' }) => {
    const borderColor = sex === 'F' ? colors.female : colors.primary;
    return uri ? (
      <Image source={{ uri }} style={[styles.avatar, { borderColor }]} />
    ) : (
      <View style={[styles.avatar, styles.placeholder, { borderColor }]}>
        <Text style={styles.init}>{name?.[0]}</Text>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Card; index: number }) => {
    const fade = new Animated.Value(0);
    Animated.timing(fade, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }).start();

    /* card “+” */
    if (item.isAdd) {
      return (
        <Animated.View style={{ opacity: fade }}>
          <TouchableOpacity style={[styles.card, styles.addCard]} onPress={() => navigation.navigate('MatingForm')}>
            <MaterialCommunityIcons name="plus" size={48} color="#9e9e9e" />
          </TouchableOpacity>
        </Animated.View>
      );
    }

    const { gone, pct } = barData(item.date);

    return (
      <Animated.View style={{ opacity: fade }}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MatingForm', { mating: item })}>
          <View style={styles.row}>
            <Img uri={item.maleImageUri}   name={item.maleName}   sex={item.maleSex}   />
            <MaterialCommunityIcons name="heart" size={32} color="#c62828" />
            <Img uri={item.femaleImageUri} name={item.femaleName} sex={item.femaleSex} />
          </View>

          <View style={styles.rowNames}>
            <Text numberOfLines={1} style={styles.name}>{item.maleName}</Text>
            <Text numberOfLines={1} style={styles.name}>{item.femaleName}</Text>
          </View>

          <View style={styles.barBack}><View style={[styles.barFront, { width: `${pct}%` }]} /></View>
          <Text style={styles.barText}>{gone}/63 days</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={{ padding: 24, gap: 16 }}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ textAlign:'center', marginTop:40 }}>No matings yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card:{ width: WIDTH, backgroundColor: colors.card, borderRadius: radius, padding:16, alignSelf:'center', ...shadow },
  addCard:{ alignItems:'center', justifyContent:'center' },

  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  avatar:{ width:IMG, height:IMG, borderRadius:radius, borderWidth:3, overflow:'hidden' },
  placeholder:{ alignItems:'center', justifyContent:'center', backgroundColor: colors.background },
  init:{ fontSize:28, fontWeight:'700', color: colors.primary },

  rowNames:{ flexDirection:'row', justifyContent:'space-between', marginTop:6 },
  name:{ width:IMG, textAlign:'center', fontWeight:'600', color: colors.text, fontSize:12 },

  barBack:{ height:10, backgroundColor:'#e0e0e0', borderRadius:5, marginTop:14 },
  barFront:{ height:10, backgroundColor: colors.primary, borderRadius:5 },
  barText:{ marginTop:4, fontSize:12, color:'#555', textAlign:'right' }
});

import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, Alert, Dimensions } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getGeneticTests, deleteGeneticTest } from '../db';
import type { GeneticTest } from '../types';
import { colors, radius, shadow } from '../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GeneticsList'>;
interface Row extends GeneticTest { isAdd?: boolean }

const WIDTH = Dimensions.get('window').width - 24 * 2;

export default function GeneticsListScreen() {
  const nav = useNavigation<Nav>();
  const { dogId, dogName } = useRoute().params as any;
  const [items, setItems] = useState<GeneticTest[]>([]);

  /* async loader */
  const load = useCallback(async () => {
    setItems(await getGeneticTests(dogId));
  }, [dogId]);

  /* fix: apelăm loaderul dintr-un callback sincron */
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => { nav.setOptions({ title: `${dogName} · Genetics` }); }, []);

  const data: Row[] = useMemo(() => [...items, { id: -1, isAdd: true } as any], [items]);

  const confirmDel = (id:number)=>
    Alert.alert('Delete test','Are you sure?',[
      {text:'Cancel',style:'cancel'},
      {text:'Delete',style:'destructive',onPress:async()=>{await deleteGeneticTest(id);load();}}
    ]);

  const renderItem = ({ item, index }: { item: Row; index: number }) => {
    const fade = new Animated.Value(0);
    Animated.timing(fade,{toValue:1,duration:300,delay:index*60,useNativeDriver:true}).start();

    if(item.isAdd){
      return(
        <Animated.View style={{opacity:fade}}>
          <TouchableOpacity style={[styles.card,styles.add]} onPress={()=>nav.navigate('GeneticsForm',{dogId})}>
            <MaterialCommunityIcons name="plus" size={48} color="#9e9e9e"/>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return(
      <Animated.View style={{opacity:fade}}>
        <View style={styles.card}>
          <View style={{flex:1,gap:2}}>
            <Text style={styles.title}>{item.testName}</Text>
            {item.result?.trim() && <Text style={styles.rowTxt}>Result: {item.result}</Text>}
            {item.lab?.trim()    && <Text style={styles.rowTxt}>Lab: {item.lab}</Text>}
            {item.date           && <Text style={styles.rowTxt}>Date: {item.date}</Text>}
            {item.notes?.trim()  && <Text style={styles.rowTxt}>Notes: {item.notes}</Text>}
          </View>
          <TouchableOpacity onPress={()=>confirmDel(item.id!)}>
            <MaterialCommunityIcons name="trash-can-outline" size={26} color="#b00020"/>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return(
    <FlatList
      data={data}
      keyExtractor={i=>String(i.id)}
      contentContainerStyle={{padding:24,gap:16}}
      renderItem={renderItem}
      ListEmptyComponent={<Text style={{textAlign:'center',marginTop:40}}>No genetic tests.</Text>}
    />
  );
}

const styles=StyleSheet.create({
  card:{width:WIDTH,backgroundColor:colors.card,borderRadius:radius,padding:16,flexDirection:'row',gap:12,alignItems:'flex-start',...shadow},
  add:{justifyContent:'center',alignItems:'center'},
  title:{fontWeight:'700',color:colors.text,marginBottom:2},
  rowTxt:{color:'#555'}
});

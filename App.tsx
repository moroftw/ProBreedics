import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import AppLoading from 'expo-app-loading';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';

import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import DogsGridScreen from './src/screens/DogsGridScreen';
import DogMenuScreen from './src/screens/DogMenuScreen';
import QuickAddDogScreen from './src/screens/QuickAddDogScreen';
import MatingsScreen from './src/screens/MatingsScreen';
import MatingFormScreen from './src/screens/MatingFormScreen';
import DogFormScreen from './src/screens/DogFormScreen';
import GeneticsFormScreen from './src/screens/GeneticsFormScreen';
import VetRecordFormScreen from './src/screens/VetRecordFormScreen';
import GeneticsListScreen from './src/screens/GeneticsListScreen';
import VetRecordsListScreen from './src/screens/VetRecordsListScreen';
import { initDb } from './src/db';

import { Provider as PaperProvider } from 'react-native-paper'; // ✅ Asta e nou

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, size, color }) => {
          if (route.name === 'Dogs')
            return <Ionicons name={focused ? 'paw' : 'paw-outline'} size={size} color={color} />;
          if (route.name === 'Matings')
            return <Ionicons name="heart" size={size} color={focused ? colors.female : '#777'} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Dogs" component={DogsGridScreen} options={{ title: 'Dogs' }} />
      <Tab.Screen name="Matings" component={MatingsScreen} options={{ title: 'Matings' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold });
  useEffect(() => { void initDb(); }, []);

  if (!fontsLoaded) return <AppLoading />;

  return (
    <PaperProvider> {/* ✅ învelești tot */}
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            ...DefaultTheme,
            colors: { ...DefaultTheme.colors, background: colors.background },
          }}
        >
          <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
            <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="QuickAddDog" component={QuickAddDogScreen} options={{ title: 'Add Dog' }} />
            <Stack.Screen name="DogMenu" component={DogMenuScreen} options={{ title: 'Dog' }} />
            <Stack.Screen name="DogForm" component={DogFormScreen} options={{ title: 'Breeding Profile' }} />
            <Stack.Screen name="MatingForm" component={MatingFormScreen} options={{ title: 'Add / Edit Mating' }} />
            <Stack.Screen name="GeneticsForm" component={GeneticsFormScreen} options={{ title: 'Add Genetic Test' }} />
            <Stack.Screen name="VetRecordForm" component={VetRecordFormScreen} options={{ title: 'Add Vet Record' }} />
            <Stack.Screen name="GeneticsList" component={GeneticsListScreen} />
            <Stack.Screen name="VetRecordsList" component={VetRecordsListScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
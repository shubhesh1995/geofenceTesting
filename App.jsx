import * as React from 'react';
import { SafeAreaView, ScrollView, StatusBar} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Page1 } from './screens/BasicApp-with-individual-geofence-removal/Page1';
import { Page2 } from './screens/BasicApp-with-individual-geofence-removal/Page2';
const Stack = createNativeStackNavigator();
function App() {
  return (
    <SafeAreaView style={{ flex: 1, width: '100%' }}>
      <StatusBar backgroundColor={`#000`} />
        <NavigationContainer>
          <Stack.Navigator initialRouteName={'page1'} screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
            <Stack.Screen name={'page1'} component={Page1} />
            <Stack.Screen name={'page2'} component={Page2} />
          </Stack.Navigator>
        </NavigationContainer>
    </SafeAreaView>
  );
}
export default App;












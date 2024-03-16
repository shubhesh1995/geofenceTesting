import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
/*react and react-native realted export end*/
import BackgroundGeolocation from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';



export const Page2 = () => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [checkUpdate, setCheckUpdate] = useState(false);
    const [originEvents, setOriginEvents] = useState('');
    const [stopEvents, setStopEvents] = useState('');
    const [destinationEvents, setDestinationEvents] = useState('');
    const [locations, setLocations] = useState({
        origin: {
            latitude: 0,
            longitude: 0,
            identifier: 'origin',
        },
        destination: {
            latitude: 0,
            longitude: 0,
            identifier: 'destination',
        },
        stop: {
            latitude: 0,
            longitude: 0,
            identifier: 'stop',
        },
    });

    let loggerFunction = () => {
        // background-geolocation code 
        let Logger = BackgroundGeolocation.logger;
        Logger.emailLog("shubheshsrivastava@gmail.com").then((success) => {
            // console.log("[emailLog] success");
        }).catch((error) => {
            // console.log("[emailLog] FAILURE: ", error);
        });
    }

    let removeGeofenceFunction = async () => {
        try {
            let bookingNum = await AsyncStorage.getItem('booking_number');
            await AsyncStorage.removeItem('ispage2');
            await AsyncStorage.removeItem('origin');
            await AsyncStorage.removeItem('stop');
            await AsyncStorage.removeItem('destination');
            let geofencesArr = await BackgroundGeolocation.getGeofences();
            if (geofencesArr?.length > 0) {
                BackgroundGeolocation.removeGeofences().then(() => {
                    BackgroundGeolocation.logger.info(`icargo4u ->  Booking-> ${bookingNum} -> geofence Removed`);
                })
            }
            // BackgroundGeolocation.logger.info(`icargo4u ->  Booking-> ${bookingNum} -> Remove button press`);
            navigation.navigate('page1');
        } catch (err) {
            console.log(err);
        }
    }

    let getData = async () => {
        try {
            setCheckUpdate(prv => true);
            let originEvent = await AsyncStorage.getItem('origin');
            let stopEvent = await AsyncStorage.getItem('stop');
            let destinationEvent = await AsyncStorage.getItem('destination');
            if (originEvent) {
                setOriginEvents(originEvent)
            }
            if (stopEvent) {
                setStopEvents(stopEvent)
            }
            if (destinationEvent) {
                setDestinationEvents(destinationEvent)
            }
            setCheckUpdate(prv => false);
        } catch (err) {
            console.log(err);
            setCheckUpdate(prv => false);
        }
    }

    useEffect(() => {
        let checkData = async () => {
            getData();
            let geofencesData = await AsyncStorage.getItem('locations');
            if (geofencesData) {
                let obj = JSON.parse(geofencesData);
                setLocations(obj);
            }
        }
        checkData();
        let getUpdate = setInterval(() => {
            getData();
        }, 5000);
        return () => {
            clearInterval(getUpdate);
        }
    }, [isFocused]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.h1}>Simple Geofence App</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.h1} marginBottom={20}>
                    Locations list
                </Text>
                {Object.values(locations)?.map((i, ind) => (
                    <View key={ind}>
                        <Text style={styles.h1}>Identifier: {i.identifier}</Text>
                        <Text style={styles.h1}>lat: {i.latitude}, long: {i.longitude}</Text>
                    </View>
                ))
                }
                <Text style={styles.h1} marginBottom={20}>
                    Events of location
                </Text>
                <Text style={styles.h1} marginBottom={20}>
                    Origin Events : {originEvents || 'N/A'}
                </Text>
                <Text style={styles.h1} marginBottom={20}>
                    Stop Events : {stopEvents || 'N/A'}
                </Text>
                <Text style={styles.h1} marginBottom={20}>
                    Destination Events : {destinationEvents || 'N/A'}
                </Text>
                <TouchableOpacity style={styles.addbutton} onPress={removeGeofenceFunction}>
                    <Text style={styles.text_white}>
                        Remove Geofences
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.logbutton} onPress={loggerFunction}>
                    <Text style={styles.text_black}>
                        Get Log
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },

    header: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#ECFBFD'
    },

    h1: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16
    },

    content: {
        flex: 1,
        padding: 20,
        gap: 15
    },

    footer: {
        gap: 5
    },

    addbutton: {
        backgroundColor: 'red',
        height: 35,
        alignItems: 'center',
        justifyContent: 'center'
    },

    logbutton: {
        backgroundColor: 'cyan',
        height: 35,
        alignItems: 'center',
        justifyContent: 'center'
    },

    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        color: '#000'
    },

    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 15,
        color: '#000'
    },

    text_white: {
        color: '#fff',
        fontSize: 14,
        letterSpacing: 1
    },

    text_black: {
        color: '#000',
        fontSize: 14,
        letterSpacing: 1
    },

    refreshBtn: {
        borderBottomColor: 'blue',
        borderBottomWidth: 1,
        color: 'blue'
    }
});



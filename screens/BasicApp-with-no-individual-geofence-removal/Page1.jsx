import { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Switch, TouchableOpacity, TextInput, ScrollView } from 'react-native'
/*react and react-native realted export end*/
import BackgroundGeolocation from 'react-native-background-geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';
const bgLocationConfigObj = {
    backgroundPermissionRationale: {
        title: "Allow iCargo4U-XPress Service to access device's location in the background?",
        message: "In order to track activity in the background, please enable Allow all the time location permission",
        positiveAction: "Change to Allow all the time",
        negativeAction: "Cancel"
    },
    url: "https://tracker.transistorsoft.com",
    orgname: "Induspac",
    username: "ashvtk",
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    disableLocationAuthorizationAlert: false,
    disableMotionActivityUpdates: false,
    disableStopDetection: false,
    disableElasticity: false,
    distanceFilter: 0, //will make it higher once in production
    debug: true,
    desiredOdometerAccuracy: 10,
    locationUpdateInterval: 5000,
    fastestLocationUpdateInterval: 5000,
    elasticityMultiplier: 1, //will make it higher once in production
    locationAuthorizationRequest: 'Always',
    locationAuthorizationAlert: {
        titleWhenNotEnabled: "Location-services are not ENABLED",
        titleWhenOff: "Location-services are OFF",
        instructions: "You must enable 'Always' in location-services to use this application",
        cancelButton: "Cancel",
        settingsButton: "Settings"
    },
    logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE, //will remove once in production
    maxDaysToPersist: 3, //will remove once in production
    maxRecordsToPersist: -1, //will remove once in production
    motionTriggerDelay: 6000,
    startOnBoot: true,
    stopOnTerminate: false,
    stopTimeout: 5,
    geofenceModeHighAccuracy: false,
    geofenceInitialTriggerEntry: true
};

export const Page1 = () => {
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const [isEnabled, setIsEnabled] = useState(false);
    const [forceRefreshEvent, setForceRefreshEvent] = useState(false);
    const subscriptions = [];
    const [origin, setOrigin] = useState({
        latitude: '',
        longitude: ''
    });

    const [destination, setDestination] = useState({
        latitude: '',
        longitude: ''
    });

    const [stop, setStop] = useState({
        latitude: '',
        longitude: ''
    });

    let addGeofenceFunction = async () => {
        try {
            if (!origin.latitude || !destination.latitude || !stop.latitude) {
                alert('Please fill all location (Origin, Stop, Destination) to proceed');
                return false;
            } else {
                let addGeofenceArr = [
                    {
                        latitude: Number(origin.latitude),
                        longitude: Number(origin.longitude),
                        identifier: "origin",
                        radius: 205,
                        notifyOnEntry: true,
                        notifyOnExit: true,
                    },
                    {
                        latitude: Number(stop.latitude),
                        longitude: Number(stop.longitude),
                        identifier: "stop",
                        radius: 205,
                        notifyOnEntry: true,
                        notifyOnExit: true,
                    },
                    {
                        latitude: Number(destination.latitude),
                        longitude: Number(destination.longitude),
                        identifier: "destination",
                        radius: 205,
                        notifyOnEntry: true,
                        notifyOnExit: true,
                    }
                ];
                let bookingNum = Number(await AsyncStorage.getItem('booking_number') || 0);
                let ispage2 = await AsyncStorage.getItem('ispage2');
                if (!ispage2) {
                    BackgroundGeolocation.addGeofences(addGeofenceArr).then(() => {
                        let addBooking = async () => {
                            let geofencesArr = await BackgroundGeolocation.getGeofences();
                            setForceRefreshEvent(prv => !prv);
                            BackgroundGeolocation.logger.info(`icargo4u ->  Booking-> ${bookingNum + 1} -> geofence added ${JSON.stringify(addGeofenceArr)}`);
                            BackgroundGeolocation.logger.info(`icargo4u ->  Booking-> ${bookingNum + 1} -> geofencesArr ${JSON.stringify(geofencesArr)}`);
                            await AsyncStorage.setItem('booking_number', `${bookingNum + 1}`)
                            await AsyncStorage.setItem('locations', JSON.stringify(addGeofenceArr));
                            await AsyncStorage.setItem('ispage2', 'true');
                            navigation.navigate('page2');
                        }
                        addBooking();
                    })
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    const onGeofence = (geofenceEvent) => {
        BackgroundGeolocation.logger.info(`icargo4u -> geofenceEvent -> ${geofenceEvent}`);
        if (geofenceEvent.identifier == "origin") {
            if (geofenceEvent.action == "ENTER") {
                BackgroundGeolocation.logger.info(`icargo4u -> origin-enter`);
                let AsyncFunction = async () => {
                    await AsyncStorage.setItem('origin', 'Enter');
                }
                AsyncFunction();

            }
            else if (geofenceEvent.action == "EXIT") {
                let AsyncFunction = async () => {
                    await AsyncStorage.setItem('origin', 'Enter,Exit');
                }
                AsyncFunction();
                // BackgroundGeolocation.removeGeofence('origin').then(() => {
                //     BackgroundGeolocation.logger.info(`icargo4u -> origin-exit -> origin-remove`);
                // });
                BackgroundGeolocation.logger.info(`icargo4u -> origin-exit`);
            }
        }
        else if (geofenceEvent.identifier == "destination") {
            if (geofenceEvent.action == "ENTER") {
                BackgroundGeolocation.logger.info(`icargo4u -> destination-enter`);
                let AsyncFunction = async () => {
                    await AsyncStorage.setItem('destination', 'Enter');
                }
                AsyncFunction();
            }
            else if (geofenceEvent.action == "EXIT") {
                let AsyncFunction = async () => {
                    await AsyncStorage.setItem('destination', 'Enter,Exit');
                }
                AsyncFunction();
                // BackgroundGeolocation.removeGeofence('destination').then(() => {
                //     BackgroundGeolocation.logger.info(`icargo4u -> destination-exit -> destination-remove`);
                // });
                BackgroundGeolocation.logger.info(`icargo4u -> destination-exit`);
            }
        }
        else if (geofenceEvent.identifier == "stop") {
            if (geofenceEvent.action == "ENTER") {
                let AsyncFunction = async () => {
                    await AsyncStorage.setItem('stop', 'Enter');
                }
                AsyncFunction();
                BackgroundGeolocation.logger.info(`icargo4u -> stop-enter`);
            }
            else if (geofenceEvent.action == "EXIT") {
                let AsyncFunction = async () => {
                    await AsyncStorage.setItem('stop', 'Enter,Exit');
                }
                AsyncFunction();
                // BackgroundGeolocation.removeGeofence('stop').then(() => {
                //     BackgroundGeolocation.logger.info(`icargo4u -> stop-exit -> stop-remove`);
                // });
                BackgroundGeolocation.logger.info(`icargo4u -> stop-exit`);
            }
        }
        BackgroundGeolocation.logger.info(`icargo4u -> subscription_count-> ${subscriptions?.length}`);
    }

    let loggerFunction = () => {
        // background-geolocation code 
        let Logger = BackgroundGeolocation.logger;
        Logger.emailLog("shubheshsrivastava@gmail.com").then((success) => {
            // console.log("[emailLog] success");
        }).catch((error) => {
            // console.log("[emailLog] FAILURE: ", error);
        });
    }

    const subscribe = (subscription) => {
        subscriptions.push(subscription);
    }
    // added
    const onClickEnable = async (value) => {
        // let state = await BackgroundGeolocation.getState();
        // console.log(state);
        setIsEnabled(value);
        if (value) {
            BackgroundGeolocation.start();
        } else {
            BackgroundGeolocation.stop();
        }
    }

    useEffect(() => {
        let firstTimeRunFunc = async () => {
            // 1. ready the plugin.
            let url = "https://tracker.transistorsoft.com";
            let orgname = "Induspac";
            let username = "ashvtk";

            // Fetch an authoriztion token from server.  The SDK will cache the received token.
            let token = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(orgname, username, url);
            BackgroundGeolocation.ready({ ...bgLocationConfigObj, transistorAuthorizationToken: token }).then(res => {
                // console.log('ready')
                BackgroundGeolocation.logger.info(`icargo4u -> config ready`);
                BackgroundGeolocation.logger.info(`icargo4u -> ${JSON.stringify({ ...bgLocationConfigObj, transistorAuthorizationToken: token })}`);
            });

            // 2. Subscribe to events.
            subscribe(BackgroundGeolocation.onLocation((event) => {
                BackgroundGeolocation.logger.info(`icargo4u -> onLocation -> background-tracking`);
            }));

            subscribe(BackgroundGeolocation.onGeofence(onGeofence))
            // subscriptions.push(onLocation);
            // added 
            BackgroundGeolocation.getState().then((state) => {
                setIsEnabled(state.enabled);
            });
        }
        firstTimeRunFunc();
        // Listen to geofence events.
        return () => {
            subscriptions.forEach(sub => sub.remove());
        }
    }, []);

    useEffect(() => {
        let checkGeofence = async () => {
            // let geofencesArr = await BackgroundGeolocation.getGeofences();
            let ispage2 = await AsyncStorage.getItem('ispage2');
            if (ispage2) {
                navigation.navigate('page2');
            }
        }
        checkGeofence();
    }, [isFocused]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.h1}>Simple Geofence App</Text>
                </View>
                <View>
                    <Switch
                        value={isEnabled}
                        onValueChange={(val) => onClickEnable(val)}
                    />
                </View>
            </View>
            {/* Origin */}
            <View style={styles.content}>
                <ScrollView style={{ flex: 1 }}>
                    <View style={{ gap: 15, padding: 20 }}>
                        <Text style={styles.label}>Origin</Text>
                        <View>
                            <TextInput keyboardType='numeric'
                                style={styles.input}
                                value={origin.latitude.toString()}
                                onChangeText={(val) => setOrigin(prv => { return { ...prv, latitude: val } })}
                                placeholder='Latitude'
                                placeholderTextColor='#9fa1a4'
                            />
                        </View>
                        <View>
                            <TextInput keyboardType='numeric'
                                style={styles.input}
                                value={origin.longitude}
                                onChangeText={(val) => setOrigin(prv => { return { ...prv, longitude: val } })}
                                placeholder='Longitude'
                                placeholderTextColor='#9fa1a4'
                            />
                        </View>
                        <Text style={styles.label}>Stop</Text>
                        <View>
                            <TextInput keyboardType='numeric'
                                style={styles.input}
                                value={stop.latitude}
                                onChangeText={(val) => setStop(prv => { return { ...prv, latitude: val } })}
                                placeholder='Latitude'
                                placeholderTextColor='#9fa1a4'
                            />
                        </View>
                        <View>
                            <TextInput keyboardType='numeric'
                                style={styles.input}
                                value={stop.longitude}
                                onChangeText={(val) => setStop(prv => { return { ...prv, longitude: val } })}
                                placeholder='Longitude'
                                placeholderTextColor='#9fa1a4'
                            />
                        </View>
                        <Text style={styles.label}>Destination</Text>
                        <View>
                            <TextInput keyboardType='numeric'
                                style={styles.input}
                                value={destination.latitude}
                                onChangeText={(val) => setDestination(prv => { return { ...prv, latitude: val } })}
                                placeholder='Latitude'
                                placeholderTextColor='#9fa1a4'
                            />
                        </View>
                        <View>
                            <TextInput keyboardType='numeric'
                                style={styles.input}
                                value={destination.longitude}
                                onChangeText={(val) => setDestination(prv => { return { ...prv, longitude: val } })}
                                placeholder='Longitude'
                                placeholderTextColor='#9fa1a4'
                            />
                        </View>
                        <TouchableOpacity style={styles.addbutton} onPress={addGeofenceFunction}>
                        <Text style={styles.text_white}>
                            Add Geofences
                        </Text>
                    </TouchableOpacity>
                    </View>
                </ScrollView>
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
    },

    footer: {
        gap: 5
    },

    addbutton: {
        backgroundColor: 'green',
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
});




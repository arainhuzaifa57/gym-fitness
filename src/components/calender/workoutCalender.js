// WorkoutCalendar.js

import React, { useEffect, useState } from 'react';
import { Text, View, Modal, Button, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecordedWorkoutDay } from '../../api/features/workoutCalendar/workoutCalendarSlice';
import { navigate } from '../../navigation/rootNavigation';
import { routes } from '../../constants/routes';
import { fetchWorkoutDatesForMonth } from '../../api/firebase/db';
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import moment from 'moment';



export default function WorkoutCalendar() {
    const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
    const [markedDates, setMarkedDates] = useState({});
    const dispatch = useDispatch()

    useEffect(() => {
        const uid = auth().currentUser?.uid;  // Added optional chaining in case currentUser is null
        if (!uid) {
            console.log("User not authenticated");
            return;
        }
    
        const [year, month] = currentMonth.split('-').map(Number);
        let initialFetch = true;
    
        // Define the Firestore subcollection reference
        const workoutsCollectionRef = firestore().collection('users').doc(uid).collection('recordedWorkouts');
    
        // Listen for real-time updates
        const unsubscribe = workoutsCollectionRef.onSnapshot(snapshot => {
            if (!snapshot) {
                console.log("Snapshot is null");
                return;
            }
    
            let newDates = [];
    
            snapshot.forEach(doc => {
                const workoutData = doc.data();
                if (workoutData && workoutData.createdAt) {
                    // Additional check for data integrity
                    const workoutDate = workoutData.createdAt.toDate && workoutData.createdAt.toDate() instanceof Date 
                                        ? workoutData.createdAt.toDate() 
                                        : new Date(workoutData.createdAt);
    
                    // Check if workoutDate is a valid date
                    if (!isNaN(workoutDate)) {
                        newDates.push(workoutDate);
                    }
                }
            });
    
            // Format and set marked dates
            const formattedDates = formatDates(newDates);
            setMarkedDates(formattedDates);
    
            if (initialFetch) {
                initialFetch = false; // Prevent refetching on the initial load
            } else {
                console.log('Real-time update:', formattedDates);
            }
        });
    
        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, [currentMonth]); // Dependency on currentMonth to refetch on month change
    
    const onMonthChange = (month) => {
        setCurrentMonth(`${month.year}-${month.month}`);
    };

    const goToRecordedDay = (date) => {
        dispatch(fetchRecordedWorkoutDay(date));
        console.log(date)
        navigate(routes.workoutDayHistory)
    };

    // custom day components
    const CustomDay = ({ state, marking, onPress, date, onMarkedPress }) => {
        const isMarked = marking?.marked;

        if (state === 'disabled') {
            return (
                <View style={{
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Text className='text-center text-gray-500'>{date.day}</Text>
                </View>
            );
        }

        //cyan-900 0891b2
        return (
            <TouchableOpacity
                onPress={() => isMarked ? onMarkedPress(date) : {}}
                activeOpacity={isMarked ? 0.5 : 1}
            >
                <View style={{
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                    borderWidth: isMarked ? 1 : 0,  // Set border width for marked days
                    borderColor: isMarked ? '#0891b2' : 'transparent', 
                    backgroundColor: isMarked ? '#102839' : 'transparent',
                }}>
                    <Text style={{ textAlign: 'center', color: isMarked ? 'white' : 'white' }}>
                        {date.day}
                    </Text>
                    {/* {isMarked && (
                    <View style={{
                        marginTop: 4,  // Adjust spacing from the date text
                        width: 6,     // Dot width
                        height: 6,    // Dot height
                        borderRadius: 3,  // Half of width/height to make it circular
                        backgroundColor: '#0891b2',  // Dot color, change as needed
                    }} />
                )} */}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className='w-11/12 mx-2 my-3'>
            <Calendar
                markedDates={markedDates}
                onMonthChange={onMonthChange}
                dayComponent={({ date, state, marking, onPress }) => (
                    <CustomDay
                        date={date}
                        state={state}
                        marking={marking}
                        onPress={onPress}
                        onMarkedPress={() => goToRecordedDay(date.dateString)}
                    />
                )}
                theme={{
                    backgroundColor: '#172033',
                    calendarBackground: '#172033',
                    textSectionTitleColor: '#f9fafb',
                    dayTextColor: 'white',
                    monthTextColor: 'white',
                    arrowColor: '#06b6d4',
                }}
            />
            {/* <TouchableOpacity
                onPress={() => console.log(markedDates)}
            >
                <Text className="text-white">
                    Testing for Dates
                </Text>
            </TouchableOpacity> */}
        </View>
    );
}


function getCurrentMonth() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}`;
}

function formatDates(dates) {
    return dates.reduce((acc, date) => {
        // Convert to Moment.js date object
        const momentDate = moment(date);

        // Format the date to YYYY-MM-DD
        const formattedDate = momentDate.format('YYYY-MM-DD');

        // Mark the date in the calendar
        acc[formattedDate] = { selected: true, marked: true };
        return acc;
    }, {});
}

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import drinkData from './drinkData.json'; // Adjust the path as necessary

const BACCalculator = ({ route }) => {
    const { userData } = route?.params || {};

    // Check if userData is provided
    if (!userData) {
        Alert.alert("Error", "User data is missing. Please return to the Home screen.");
        return null; // Prevent rendering
    }

    // Destructure with fallbacks to avoid crashes
    const { age, weight, heightFeet, heightInches, gender } = userData;

    // Ensure the data exists before proceeding
    if (!age || !weight || !heightFeet || !heightInches || !gender) {
        Alert.alert("Error", "Incomplete user data. Please fill out all fields on the home screen.");
        return null;
    }

    const [drinkType, setDrinkType] = useState('beer');
    const [drinkVolume, setDrinkVolume] = useState(''); // Volume of drink in ounces
    const [totalCalories, setTotalCalories] = useState(0);
    const [totalBAC, setTotalBAC] = useState(0);

    // Function to calculate BAC
    const calculateBAC = (calories) => {
        const weightInGrams = weight * 453.592; // convert pounds to grams
        const bodyWaterConstant = gender === 'male' ? 0.58 : 0.49; // Gender constant
        const alcoholConsumed = (calories / 7) * 0.789; // Convert calories to grams of alcohol

        const bac = (alcoholConsumed / (weightInGrams * bodyWaterConstant)) * 100;

        return bac;
    };

    // Function to calculate calories from the selected drink
    const calculateCalories = () => {
        const volume = parseFloat(drinkVolume);
        if (!volume || volume <= 0) {
            Alert.alert("Input Error", "Please enter a valid volume of the drink.");
            return;
        }

        // Find the drink in the JSON data
        const drink = drinkData.drinks.find(d => d.name.toLowerCase() === drinkType.toLowerCase());
        if (!drink) {
            Alert.alert("Error", "Drink type not found. Please enter a valid drink type.");
            return;
        }

        const calories = (drink.calories * volume) / 12; // Assuming the drink volume is in ounces
        setTotalCalories(prevCalories => prevCalories + calories);
        const newBAC = calculateBAC(totalCalories + calories);
        setTotalBAC(newBAC);
        Alert.alert(`Calories Consumed: ${calories.toFixed(2)} kcal`);
    };

    const handleSubmit = () => {
        calculateCalories();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.title}> Calculator</Text>

                <Text style={styles.label}>Type of Drink:</Text>
                <TextInput
                    style={styles.input}
                    value={drinkType}
                    onChangeText={setDrinkType}
                    placeholder="e.g., beer, wine, spirits"
                />

                <Text style={styles.label}>Volume of Drink (oz):</Text>
                <TextInput
                    style={styles.input}
                    value={drinkVolume}
                    onChangeText={setDrinkVolume}
                    keyboardType="numeric"
                    placeholder="Enter volume"
                />

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Calculate</Text>
                </TouchableOpacity>

                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>Total Calories: {totalCalories.toFixed(2)} kcal</Text>
                    <Text style={styles.resultText}>Estimated BAC: {totalBAC.toFixed(4)}</Text>

                    {totalBAC > 0.08 && (
                        <View style={styles.warningBox}>
                            <Text style={styles.warningText}>We recommend you get a ride!</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#2c2c2c',
    },
    title: {
        fontSize: 28,
        marginBottom: 20,
        color: '#f8dc1c',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        color: '#f8dc1c',
    },
    input: {
        height: 50,
        borderColor: '#f8dc1c',
        borderWidth: 2,
        borderRadius: 8,
        paddingLeft: 15,
        color: '#3d5a80',
        backgroundColor: '#ffffff',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#f8dc1c',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    submitButtonText: {
        fontSize: 20,
        color: '#3d5a80',
        fontWeight: 'bold',
    },
    resultContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#3d5a80',
        borderRadius: 8,
        alignItems: 'center',
    },
    resultText: {
        fontSize: 18,
        color: '#ffffff',
        marginBottom: 5,
    },
    warningBox: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#ff4c4c', // Red background for warning
        borderRadius: 8,
        alignItems: 'center',
        width: '100%', // Make it full width or adjust as needed
    },
    warningText: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: 'bold',
    },
});

export default BACCalculator;

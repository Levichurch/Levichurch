import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';

const HomeScreen = ({ navigation }) => {
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [heightFeet, setHeightFeet] = useState('');
    const [heightInches, setHeightInches] = useState('');
    const [gender, setGender] = useState('male');

    useEffect(() => {
        // Load user data from temporary storage
        const loadUserData = async () => {
            // Your code here (if needed)
        };

        loadUserData();
    }, []);

    const handleSubmit = async () => {
        if (!age || !weight || !heightFeet || !heightInches) {
            Alert.alert("Input Error", "Please fill in all fields.");
            return;
        }

        const userData = { age, weight, heightFeet, heightInches, gender };
        console.log("Navigating with userData:", userData);
        navigation.navigate('Calculator', { userData });
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.title}>Let's Get Started</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Age (years)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Age"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Weight (lbs)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Weight"
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.heightGroup}>
                    <View style={styles.heightInputGroup}>
                        <Text style={styles.label}>Height (ft)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Feet"
                            value={heightFeet}
                            onChangeText={setHeightFeet}
                            keyboardType="numeric"
                        />
                    </View>
                    
                    <View style={styles.heightInputGroup}>
                        <Text style={styles.label}>Height (in)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Inches"
                            value={heightInches}
                            onChangeText={setHeightInches}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <Text style={styles.label}>Gender</Text>
                <View style={styles.genderButtons}>
                    <TouchableOpacity 
                        style={[styles.genderButton, gender === 'male' && styles.selectedGender]} 
                        onPress={() => setGender('male')}
                    >
                        <Text style={styles.genderText}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.genderButton, gender === 'female' && styles.selectedGender]} 
                        onPress={() => setGender('female')}
                    >
                        <Text style={styles.genderText}>Female</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
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
        marginBottom: 30,
        color: '#f8dc1c',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    inputGroup: {
        marginBottom: 20,
    },
    heightGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    heightInputGroup: {
        flex: 1,
        marginRight: 10,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        color: '#f8dc1c',
        fontWeight: '600',
    },
    input: {
        height: 50,
        borderColor: '#f8dc1c',
        borderWidth: 2,
        borderRadius: 8,
        paddingLeft: 15,
        color: '#3d5a80',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    genderButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    genderButton: {
        flex: 1,
        padding: 15,
        borderColor: '#f8dc1c',
        borderWidth: 2,
        borderRadius: 8,
        marginRight: 5,
        alignItems: 'center',
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    selectedGender: {
        backgroundColor: '#f8dc1c',
    },
    genderText: {
        color: '#3d5a80',
        fontWeight: 'bold',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#f8dc1c',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    submitButtonText: {
        fontSize: 20,
        color: '#3d5a80',
        fontWeight: 'bold',
    },
});

export default HomeScreen;

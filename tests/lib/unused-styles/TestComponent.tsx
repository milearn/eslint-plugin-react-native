import React from 'react';
import { View, Text } from 'react-native';
import styles from './TestComponentStyle';

export default class TestComponent extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Random Text</Text>
            </View>
        )
    }
}
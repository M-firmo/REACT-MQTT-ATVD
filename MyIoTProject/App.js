import React, { useState, useEffect } from 'react';
import { env } from 'expo-env';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MQTTService from './src/services/mqttService';
import StatusModal from './src/components/StatusModal';
import LightControl from './src/components/LightControl';
import Gauges from './src/components/Gauges';

const mqtt = new MQTTService();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);
  const [history, setHistory] = useState([]);

  const mqttConfig = {
    host: env.MQTT_HOST,
    port: parseInt(env.MQTT_PORT),
    path: env.MQTT_PATH,
    user: env.MQTT_USER,
    pass: env.MQTT_PASS,
    clientId: 'RN_App_' + Math.random(),
  };

  useEffect(() => {
    loadHistory();
    startConnection();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('@historico_sensores');
      if (savedHistory !== null) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.log('Erro ao carregar o histórico:', e);
    }
  };

  const saveReading = async (tempVal, humVal) => {
    try {
      const timestamp = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const newReading = {
        id: Math.random().toString(),
        time: timestamp,
        temp: tempVal,
        hum: humVal,
      };

      setHistory((prevHistory) => {
        const updated = [newReading, ...prevHistory].slice(0, 10);
        AsyncStorage.setItem('@historico_sensores', JSON.stringify(updated)).catch(
          (err) => console.log('Erro ao salvar no AsyncStorage:', err)
        );
        return updated;
      });
    } catch (e) {
      console.log('Erro ao registrar a leitura:', e);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('@historico_sensores');
      setHistory([]);
    } catch (e) {
      console.log('Erro ao limpar o histórico:', e);
    }
  };

  const startConnection = () => {
    setShowError(false);
    mqtt.connect(
      mqttConfig,
      (topic, message) => {
        if (topic === 'casa/temp') {
          const val = parseFloat(message);
          setTemp(val);
          setHum((currentHum) => {
            saveReading(val, currentHum);
            return currentHum;
          });
        }
        if (topic === 'casa/umid') {
          const val = parseFloat(message);
          setHum(val);
          setTemp((currentTemp) => {
            saveReading(currentTemp, val);
            return currentTemp;
          });
        }
        if (topic === 'casa/luz') setIsLightOn(message === "1");
      },
      () => {
        setIsConnected(true);
        mqtt.subscribe('casa/temp');
        mqtt.subscribe('casa/umid');
        mqtt.subscribe('casa/luz');
      },
      (err) => {
        setIsConnected(false);
        setShowError(true);
      }
    );
  };

  const toggleLight = () => {
    const newState = isLightOn ? "0" : "1";
    mqtt.publish('casa/luz', newState);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Smart Home IoT</Text>

      <LightControl isLightOn={isLightOn} onToggle={toggleLight} />

      <Gauges temp={temp} hum={hum} />

      {/* Seção do Histórico para Menção B */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Histórico de Leituras</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.btnClear}>Limpar</Text>
            </TouchableOpacity>
          )}
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma leitura registrada ainda...</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            style={styles.historyList}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Text style={styles.historyTime}>{item.time}</Text>
                <View style={styles.historyData}>
                  <Text style={styles.historyTemp}>{item.temp.toFixed(1)}°C</Text>
                  <Text style={styles.historyDivider}>|</Text>
                  <Text style={styles.historyHum}>{item.hum.toFixed(1)}%</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Componente de Status de Conexão */}
      <StatusModal
        visible={showError}
        onRetry={startConnection}
        onLater={() => setShowError(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
  },
  historyContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 15,
    marginTop: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  historyTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnClear: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2C',
  },
  historyTime: {
    color: '#888',
    fontSize: 14,
  },
  historyData: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTemp: {
    color: '#E74C3C',
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyDivider: {
    color: '#444',
    marginHorizontal: 8,
  },
  historyHum: {
    color: '#3498DB',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

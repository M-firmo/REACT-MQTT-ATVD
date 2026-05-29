import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  sync: {},
});

export default class MQTTService {
  constructor() {
    this.client = null;
  }

  connect(config, onMessage, onConnect, onFailure) {
    const { host, port, path, user, pass, clientId } = config;

    const cleanHost = host.replace('wss://', '').replace('ws://', '').split(':')[0].split('/')[0];
    
    const cleanPort = Number(port); 
    
    const cleanPath = path || '/mqtt';

    const cleanClientId = clientId || 'RN_App_' + Math.random().toString(16).substr(2, 4);

    console.log(`[Paho] Conectando via celular na porta da atividade: ${cleanPort} com path: ${cleanPath}`);

    this.client = new Paho.MQTT.Client(cleanHost, cleanPort, cleanPath, cleanClientId);

    this.client.onMessageArrived = (message) => {
      onMessage(message.destinationName, message.payloadString);
    };

    const options = {
      userName: user,
      password: pass,
      useSSL: true, 
      onSuccess: onConnect,
      onFailure: onFailure,
      timeout: 3,
      keepAliveInterval: 60,
    };

    this.client.connect(options);
  }

  subscribe(topic) {
    this.client.subscribe(topic);
  }

  publish(topic, message) {
    const msg = new Paho.MQTT.Message(message);
    msg.destinationName = topic;
    this.client.send(msg);
  }
}
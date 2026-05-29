import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';

const StatusModal = ({ visible, onRetry, onLater }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Não foi possível conectar ao Broker HiveMQ.
            Verifique sua conexão e credenciais.
          </Text>

          <TouchableOpacity style={styles.btnRetry} onPress={onRetry}>
            <Text style={styles.btnText}>Tentar Novamente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLater} onPress={onLater}>
            <Text style={styles.btnText}>Tentar Mais Tarde</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 30,
    borderRadius: 20,
    width: '85%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalText: {
    color: '#FFF',
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 16,
  },
  btnRetry: {
    backgroundColor: '#27AE60',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  btnLater: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 12,
    width: '100%',
  },
  btnText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StatusModal;

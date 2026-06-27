import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';

const SecurityWarningModal = ({
  visible,
  title,
  message,
  type = 'warning',
  onDismiss,
}) => {
  const getIconName = () => {
    switch (type) {
      case 'jailbreak':
        return '🛡️';
      case 'debugger':
        return '🐞';
      case 'development':
        return '⚠️';
      default:
        return '❗️';
    }
  };

  const getColorScheme = () => {
    switch (type) {
      case 'jailbreak':
        return { background: '#fee', border: '#f44', icon: '#d32f2f' };
      case 'debugger':
        return { background: '#fef3cd', border: '#ffc107', icon: '#f57f17' };
      case 'development':
        return { background: '#e3f2fd', border: '#2196f3', icon: '#1976d2' };
      default:
        return { background: '#fff3e0', border: '#ff9800', icon: '#f57c00' };
    }
  };

  const colors = getColorScheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          {/* Header with Icon */}
          <View style={styles.header}>
            <Text style={[styles.iconText, { color: colors.icon }]}>
              {getIconName()}
            </Text>
            <Text style={[styles.title, { color: colors.icon }]}>{title}</Text>
          </View>

          {/* Message Content */}
          <ScrollView style={styles.contentScroll}>
            <Text style={styles.message}>{message}</Text>
          </ScrollView>

          {/* Footer with Actions */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.icon,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={onDismiss}
            >
              <Text style={styles.buttonText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 12,
    borderWidth: 2,
    maxWidth: 400,
    minHeight: 200,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  iconText: {
    marginRight: 12,
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 200,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SecurityWarningModal;

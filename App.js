
import React, { useState, useRef, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  FlatList,
  View,
  Text,
  SafeAreaView,
  Dimensions,
  Pressable,
  Animated,
  Easing,
  ScrollView,
  PanResponder,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import episodeData from './src/episodeData';
import EpisodeCard from './src/EpisodeCard';
import SecurityWarningModal from './src/SecurityWarningModal';
import { performSecurityCheck, getSecurityWarningMessage } from './src/securityCheck';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const DIAGNOSTICS_HEIGHT = SCREEN_H * 0.45;
const DISMISS_THRESHOLD = 100;

function App() {
  const [overlay, setOverlay] = useState(null);
  const [securityWarning, setSecurityWarning] = useState(null);
  const animation = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const panResponderRef = useRef(null);

  // Security check on mount
  useEffect(() => {
    const checkSecurity = async () => {
      const result = await performSecurityCheck();
      if (result.isInsecure) {
        const warning = getSecurityWarningMessage(result.type);
        setSecurityWarning({
          visible: true,
          type: result.type,
          title: warning.title,
          message: warning.message,
        });
      }
    };
    checkSecurity();
  }, []);

  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > 5,
    onPanResponderMove: (evt, gestureState) => {
      const clampedY = Math.max(0, gestureState.dy);
      const resistedY = clampedY * 0.5;
      panY.setValue(resistedY);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const velocityY = gestureState.vy;
      const distanceY = gestureState.dy;

      if (velocityY > 0.5 || distanceY > DISMISS_THRESHOLD) {
        Animated.parallel([
          Animated.timing(panY, {
            toValue: DIAGNOSTICS_HEIGHT + 100,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: false,
          }),
        ]).start(() => {
          setOverlay(null);
          panY.setValue(0);
        });
      } else {
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }).start();
      }
    },
  });
  }

  const handleRequestExpand = (item, layout) => {
    setOverlay({ item, layout });
    animation.setValue(0);
    panY.setValue(0);

    Animated.timing(animation, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const closeOverlay = () => {
    if (!overlay) {
      return;
    }

    Animated.parallel([
      Animated.timing(animation, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(panY, {
        toValue: DIAGNOSTICS_HEIGHT,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOverlay(null);
      panY.setValue(0);
    });
  };

  const overlayLayout = overlay?.layout;
  const startTop = overlayLayout?.y ?? SCREEN_H / 2 - 120;
  const startLeft = overlayLayout?.x ?? 20;
  const startWidth = overlayLayout?.width ?? SCREEN_W - 40;
  const startHeight = overlayLayout?.height ?? 180;

  const animatedOverlayStyle = overlay
    ? {
        top: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [startTop, 80],
        }),
        left: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [startLeft, 20],
        }),
        width: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [startWidth, SCREEN_W - 40],
        }),
        height: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [startHeight, SCREEN_H * 0.65],
        }),
        borderRadius: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 24],
        }),
      }
    : {};

  const backdropStyle = {
    opacity: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    }),
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      {securityWarning && (
        <SecurityWarningModal
          visible={securityWarning.visible}
          title={securityWarning.title}
          message={securityWarning.message}
          type={securityWarning.type}
          onDismiss={() => setSecurityWarning(null)}
        />
      )}
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ChronoLog</Text>
          <Text style={styles.subtitle}>Episodic Performance Dashboard</Text>
        </View>
        <FlatList
          data={episodeData}
          keyExtractor={(item) => item.id}
          renderItem={(props) => (
            <EpisodeCard {...props} onRequestExpand={handleRequestExpand} />
          )}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={11}
          removeClippedSubviews={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {overlay ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={12}
              reducedTransparencyFallbackColor="rgba(0,0,0,0.15)"
            />
            <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="none" />
            <Pressable style={StyleSheet.absoluteFill} onPress={closeOverlay} />
            <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
              <ScrollView style={styles.overlayInner} contentContainerStyle={styles.overlayContent}>
                <View>
                  <Text style={styles.overlayTitle}>{overlay.item.eventType.replace('_', ' ')}</Text>
                  <Text style={styles.overlayPatient}>{overlay.item.patientName}</Text>
                  <Text style={styles.overlayTime}>{new Date(overlay.item.timestamp).toLocaleString()}</Text>
                </View>

                {overlay.item.summaryText && (
                  <View style={styles.overlaySection}>
                    <Text style={styles.overlaySectionTitle}>Summary</Text>
                    <Text style={styles.overlaySectionText}>{overlay.item.summaryText}</Text>
                  </View>
                )}
              </ScrollView>
            </Animated.View>

            {/* Gesture-driven diagnostics panel */}
            <Animated.View
              style={[
                styles.diagnosticsPanel,
                {
                  transform: [{ translateY: panY }],
                },
              ]}
              {...(panResponderRef.current ? panResponderRef.current.panHandlers : {})}              
              >
              <View style={styles.panHandle} />
              <ScrollView style={styles.diagnosticsContent}>
                <Text style={styles.diagnosticsTitle}>Diagnostics</Text>

                {overlay.item.metrics && (
                  <View style={styles.diagnosticsSection}>
                    <Text style={styles.diagnosticsSectionTitle}>Vitals</Text>
                    {overlay.item.metrics.heartRate && (
                      <Text style={styles.diagnosticsText}>
                        ● Heart Rate: {overlay.item.metrics.heartRate.filter((v) => typeof v === 'number').slice(-1)[0]} bpm
                      </Text>
                    )}
                    {overlay.item.metrics.spo2 && (
                      <Text style={styles.diagnosticsText}>● SpO₂: {overlay.item.metrics.spo2}%</Text>
                    )}
                    {overlay.item.metrics.respiratoryRate && (
                      <Text style={styles.diagnosticsText}>● RR: {overlay.item.metrics.respiratoryRate} breaths/min</Text>
                    )}
                  </View>
                )}

                {overlay.item.systemPayload && (
                  <View style={styles.diagnosticsSection}>
                    <Text style={styles.diagnosticsSectionTitle}>System Info</Text>
                    <Text style={styles.diagnosticsText}>● Device: {overlay.item.systemPayload.deviceType}</Text>
                    <Text style={styles.diagnosticsText}>● Battery: {overlay.item.systemPayload.batteryLevel}%</Text>
                    <Text style={styles.diagnosticsText}>● Error Code: {overlay.item.systemPayload.errorCode}</Text>
                  </View>
                )}

                {overlay.item.media && (
                  <View style={styles.diagnosticsSection}>
                    <Text style={styles.diagnosticsSectionTitle}>Media Details</Text>
                    <Text style={styles.diagnosticsText}>● Type: {overlay.item.media.type}</Text>
                    <Text style={styles.diagnosticsText}>● Duration: {overlay.item.media.durationSeconds}s</Text>
                    {overlay.item.media.transcriptPreview && (
                      <Text style={styles.diagnosticsText}>● Transcript: {overlay.item.media.transcriptPreview}</Text>
                    )}
                  </View>
                )}

                <View style={styles.diagnosticsFooter}>
                  <Pressable onPress={closeOverlay} style={styles.closeDiagnosticsButton}>
                    <Text style={styles.closeDiagnosticsText}>Close Panel</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    marginTop: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6b7280',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    overflow: 'hidden',
  },
  overlayInner: {
    flex: 1,
    padding: 20,
  },
  overlayContent: {
    paddingBottom: 20,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  overlayPatient: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  overlayTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  overlaySection: {
    marginTop: 16,
  },
  overlaySectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  overlaySectionText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 6,
  },
  overlayFooter: {
    marginTop: 24,
    alignItems: 'flex-end',
  },
  // Diagnostics Panel Styles
  diagnosticsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DIAGNOSTICS_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  panHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  diagnosticsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  diagnosticsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginBottom: 16,
    marginTop: 8,
  },
  diagnosticsSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  diagnosticsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  diagnosticsText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  diagnosticsFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeDiagnosticsButton: {
    backgroundColor: '#f2f4f8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  closeDiagnosticsText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default App;

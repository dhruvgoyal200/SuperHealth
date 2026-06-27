import React, { useMemo, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, findNodeHandle, UIManager } from 'react-native';

const severityStyles = {
  CRITICAL: '#ef476f',
  WARNING: '#f4a261',
  ELEVATED: '#ffd166',
  ROUTINE: '#06d6a0',
  INFO: '#118ab2',
};

function formatTime(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

const EpisodeCard = React.memo(({ item, onRequestExpand }) => {
  const [expanded, setExpanded] = useState(false);
  const viewRef = useRef(null);
  const {
    eventType,
    timestamp,
    patientName,
    severity,
    summaryText,
    metrics,
    media,
    systemPayload,
    hasNotes,
  } = item;

  const badgeColor = severityStyles[severity] ?? '#999';

  const handlePress = () => {
    if (onRequestExpand) {
      const nodeHandle = findNodeHandle(viewRef.current);
      if (nodeHandle && UIManager?.measureInWindow) {
        UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
          onRequestExpand(item, { x, y, width, height });
        });
        return;
      }
      onRequestExpand(item, null);
      return;
    }

    setExpanded((prev) => !prev);
  };

  return (
    <Pressable
      ref={viewRef}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        severity === 'CRITICAL' && styles.criticalCard,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.eventType}>{eventType.replace('_', ' ')}</Text>
          <Text style={styles.patientName}>{patientName}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}> 
          <Text style={styles.badgeText}>{severity}</Text>
        </View>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
        {hasNotes ? <Text style={styles.notesChip}>Notes</Text> : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  criticalCard: {
    borderWidth: 1,
    borderColor: '#ef476f',
  },
  cardPressed: {
    opacity: 0.92,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleGroup: {
    flex: 1,
    paddingRight: 8,
  },
  eventType: {
    fontSize: 12,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  badge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
  },
  notesChip: {
    marginLeft: 10,
    color: '#05668d',
    fontWeight: '700',
    fontSize: 12,
  },
  expandedSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  expandedTitle: {
    fontSize: 13,
    color: '#444',
    fontWeight: '700',
    marginBottom: 6,
  },
  expandedText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});

export default EpisodeCard;

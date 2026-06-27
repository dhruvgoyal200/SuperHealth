const baseItems = [
  {
    eventType: 'VITALS_STREAM',
    severity: 'CRITICAL',
    patientName: 'Patient Alpha',
    summaryText:
      'Acute tachycardic episode recorded during active observation. Desaturation noted. Immediate intervention required.',
    hasNotes: true,
    metrics: {
      heartRate: [72, 75, 82, 110, 145, 130, 95, 140, 155],
      spo2: 88,
      respiratoryRate: 24,
    },
  },
  {
    eventType: 'VITALS_STREAM',
    severity: 'ROUTINE',
    patientName: 'Patient Beta',
    summaryText: null,
    hasNotes: false,
    metrics: {
      heartRate: [68, 70, 69, 72, 71],
      spo2: 98,
      respiratoryRate: 14,
    },
  },
  {
    eventType: 'CLINICAL_NOTE',
    severity: 'INFO',
    patientName: 'Patient Gamma',
    summaryText:
      'Audio dictated by Dr. S. Rao during morning rounds.',
    hasNotes: true,
    media: {
      type: 'VOICE_MEMO',
      durationSeconds: 142,
      transcriptPreview:
        'Patient reports mild discomfort in the lower left quadrant...',
    },
  },
  {
    eventType: 'SYSTEM_ALERT',
    severity: 'WARNING',
    patientName: 'Bed 4 - Telemetry Hub',
    summaryText: 'Wearable sensor connectivity lost. Battery critical.',
    hasNotes: false,
    systemPayload: {
      errorCode: 'ERR_BT_DISCONNECT',
      deviceType: 'WEARABLE_MONITOR',
      batteryLevel: 12,
    },
  },
  {
    eventType: 'VITALS_STREAM',
    severity: 'ELEVATED',
    patientName: 'Patient Delta',
    summaryText:
      'Sensor artifact detected. Partial data loss during movement.',
    hasNotes: true,
    metrics: {
      heartRate: [90, 92, null, null, 88, 85],
      spo2: null,
      respiratoryRate: 18,
    },
  },
];

const severityOrder = ['CRITICAL', 'WARNING', 'ELEVATED', 'ROUTINE', 'INFO'];

function integerInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildTimeOffset(index) {
  const now = Date.now();
  return new Date(now - index * 90_000).toISOString();
}

function buildHeartRate(base, index) {
  const trend = base.map((value) => {
    if (value == null) {
      return null;
    }
    const jitter = integerInRange(-6, 6);
    return Math.max(45, Math.min(180, value + jitter + Math.floor(index / 100)));
  });
  return trend;
}

function buildEpisodeItem(index) {
  const template = baseItems[index % baseItems.length];
  const severity = severityOrder[index % severityOrder.length];
  const hasNotes = template.hasNotes || index % 4 === 0;

  return {
    id: `ep-${100 + index}-${template.eventType.toLowerCase()}`,
    eventType: template.eventType,
    timestamp: buildTimeOffset(index),
    patientName: `${template.patientName} ${Math.floor(index / 5) + 1}`,
    severity,
    summaryText: template.summaryText,
    hasNotes,
    metrics:
      template.metrics != null
        ? {
            heartRate: buildHeartRate(template.metrics.heartRate, index),
            spo2:
              template.metrics.spo2 == null
                ? null
                : Math.max(85, Math.min(100, template.metrics.spo2 + integerInRange(-2, 2))),
            respiratoryRate:
              template.metrics.respiratoryRate == null
                ? null
                : Math.max(10, Math.min(30, template.metrics.respiratoryRate + integerInRange(-2, 2))),
          }
        : null,
    media: template.media ?? null,
    systemPayload: template.systemPayload ?? null,
  };
}

const episodeData = Array.from({ length: 2000 }, (_, index) => buildEpisodeItem(index));

export default episodeData;

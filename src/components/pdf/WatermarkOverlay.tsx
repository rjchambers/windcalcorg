import { View, Text, StyleSheet } from '@react-pdf/renderer';

const ws = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  watermarkText: {
    position: 'absolute',
    fontSize: 64,
    fontFamily: 'Helvetica-Bold',
    color: '#dc2626',
    opacity: 0.12,
    transform: 'rotate(-45deg)',
  },
});

/**
 * Heavy watermark overlay for sample / unpaid reports.
 * Renders multiple diagonal "SAMPLE" labels across the page.
 */
const WatermarkOverlay = () => (
  <View style={ws.overlay}>
    <Text style={{ ...ws.watermarkText, top: 80, left: -20 }}>SAMPLE</Text>
    <Text style={{ ...ws.watermarkText, top: 280, left: 100 }}>SAMPLE</Text>
    <Text style={{ ...ws.watermarkText, top: 480, left: -20 }}>SAMPLE</Text>
    <Text style={{ ...ws.watermarkText, top: 180, left: 280 }}>SAMPLE</Text>
    <Text style={{ ...ws.watermarkText, top: 380, left: 200 }}>SAMPLE</Text>
    <Text style={{ ...ws.watermarkText, top: 580, left: 120 }}>SAMPLE</Text>
    <Text style={{ ...ws.watermarkText, top: 680, left: 300 }}>SAMPLE</Text>
  </View>
);

export default WatermarkOverlay;

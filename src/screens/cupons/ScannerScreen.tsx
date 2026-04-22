import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { getCupomByCode, redeemCoupon, type Cupom } from '../../services/cupom.service';

const CODE_REGEX = /^[A-Z0-9]{3,32}$/;

function extractCode(raw: string): string | null {
  const trimmed = (raw || '').trim();
  if (!trimmed) return null;
  // Se for URL, pega o último segmento
  let candidate = trimmed;
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/').filter(Boolean);
      candidate = parts[parts.length - 1] || '';
    }
  } catch {
    // mantém o trimmed original
  }
  const upper = candidate.toUpperCase();
  return CODE_REGEX.test(upper) ? upper : null;
}

export default function ScannerScreen() {
  const nav = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();

  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [cupomInfo, setCupomInfo] = useState<Cupom | null>(null);
  const [validating, setValidating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const lockRef = useRef(false);

  const handleBarCodeScanned = useCallback(
    async ({ data }: BarcodeScanningResult) => {
      if (lockRef.current) return;
      const code = extractCode(data);
      if (!code) return;
      lockRef.current = true;
      setScannedCode(code);
      await validateCode(code);
    },
    []
  );

  async function validateCode(code: string) {
    setValidating(true);
    setErrorMsg(null);
    try {
      const cupom = await getCupomByCode(code);
      if (!cupom.active) {
        setErrorMsg('Este cupom não está ativo.');
        setCupomInfo(null);
        return;
      }
      if (cupom.valid_until && new Date(cupom.valid_until).getTime() < Date.now()) {
        setErrorMsg('Este cupom expirou.');
        setCupomInfo(null);
        return;
      }
      if (
        cupom.max_redemptions !== null &&
        cupom.current_redemptions >= cupom.max_redemptions
      ) {
        setErrorMsg('Este cupom foi totalmente resgatado.');
        setCupomInfo(null);
        return;
      }
      setCupomInfo(cupom);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Não foi possível validar o cupom.');
      setCupomInfo(null);
    } finally {
      setValidating(false);
    }
  }

  async function handleConfirmRedeem() {
    if (!scannedCode || !cupomInfo) return;
    setRedeeming(true);
    try {
      const result = await redeemCoupon(scannedCode);
      // Navegar para tela de sucesso substituindo a atual
      nav.replace('CupomSuccess', {
        code: result.cupom.code,
        description: result.cupom.description,
        patrocinadorName: result.cupom.patrocinador_name,
        patrocinadorLogo: result.cupom.patrocinador_logo_url,
        redeemedAt: result.resgate.redeemed_at,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erro ao resgatar cupom.';
      Alert.alert('Erro', msg);
      setRedeeming(false);
      resetScanner();
    }
  }

  function resetScanner() {
    setScannedCode(null);
    setCupomInfo(null);
    setErrorMsg(null);
    setManualCode('');
    setManualOpen(false);
    lockRef.current = false;
  }

  async function handleManualSubmit() {
    const code = extractCode(manualCode);
    if (!code) {
      Alert.alert('Código inválido', 'Informe um código válido (3 a 32 caracteres alfanuméricos).');
      return;
    }
    lockRef.current = true;
    setManualOpen(false);
    setScannedCode(code);
    await validateCode(code);
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6B1E1E" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permWrap}>
        <Icon name="camera-off-outline" size={56} color="#C84B1A" />
        <Text style={styles.permTitle}>Permissão da câmera necessária</Text>
        <Text style={styles.permMsg}>
          Para escanear o QR Code do cupom, precisamos de acesso à câmera.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Permitir câmera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.manualLink} onPress={() => setManualOpen(true)}>
          <Text style={styles.manualLinkText}>Inserir código manualmente</Text>
        </TouchableOpacity>

        {renderManualModal()}
      </View>
    );
  }

  const showResult = scannedCode !== null;

  return (
    <View style={styles.container}>
      {!showResult && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      )}

      {!showResult && (
        <>
          <View style={styles.overlayTop}>
            <Text style={styles.title}>Aponte para o QR Code do cupom</Text>
            <Text style={styles.subtitle}>Procure um QR Code no estande do patrocinador.</Text>
          </View>

          <View style={styles.frameWrap} pointerEvents="none">
            <View style={styles.frame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
          </View>

          <View style={styles.overlayBottom}>
            <TouchableOpacity style={styles.manualBtn} onPress={() => setManualOpen(true)}>
              <Icon name="keyboard-outline" size={18} color="#FFF" />
              <Text style={styles.manualBtnText}>Inserir código manualmente</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {showResult && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            {validating ? (
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <ActivityIndicator size="large" color="#6B1E1E" />
                <Text style={styles.validatingText}>Validando cupom…</Text>
              </View>
            ) : errorMsg ? (
              <View style={{ alignItems: 'center' }}>
                <View style={[styles.statusIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Icon name="close-circle" size={36} color="#D92D20" />
                </View>
                <Text style={styles.resultTitle}>Cupom inválido</Text>
                <Text style={styles.resultMsg}>{errorMsg}</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={resetScanner}>
                    <Text style={styles.secondaryBtnText}>Tentar outro</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => nav.goBack()}>
                    <Text style={styles.primaryBtnText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : cupomInfo ? (
              <View style={{ alignItems: 'center' }}>
                <View style={[styles.statusIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="ticket-percent" size={36} color="#D4A842" />
                </View>
                <Text style={styles.resultTitle}>Confirmar resgate?</Text>
                <View style={styles.patrocRow}>
                  {cupomInfo.patrocinador_logo_url ? (
                    <Image
                      source={{ uri: cupomInfo.patrocinador_logo_url }}
                      style={styles.patrocLogo}
                      resizeMode="contain"
                    />
                  ) : null}
                  <Text style={styles.patrocNameResult}>{cupomInfo.patrocinador_name}</Text>
                </View>
                <Text style={styles.resultCode}>{cupomInfo.code}</Text>
                <Text style={styles.resultDesc}>{cupomInfo.description}</Text>
                <Text style={styles.resultHint}>
                  Ao confirmar, o cupom será marcado como resgatado. Você só pode resgatar uma vez.
                </Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={resetScanner}
                    disabled={redeeming}
                  >
                    <Text style={styles.secondaryBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleConfirmRedeem}
                    disabled={redeeming}
                  >
                    {redeeming ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.primaryBtnText}>Resgatar agora</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      )}

      {renderManualModal()}
    </View>
  );

  function renderManualModal() {
    return (
      <Modal
        visible={manualOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setManualOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Inserir código</Text>
            <Text style={styles.modalHint}>Digite o código impresso no cupom.</Text>
            <TextInput
              style={styles.input}
              value={manualCode}
              onChangeText={(t) => setManualCode(t.toUpperCase())}
              placeholder="EX: ABC12345"
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={Platform.OS !== 'web'}
              maxLength={32}
            />
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setManualOpen(false)}>
                <Text style={styles.secondaryBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleManualSubmit}>
                <Text style={styles.primaryBtnText}>Validar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const FRAME_SIZE = 260;
const CORNER_SIZE = 28;
const CORNER_THICKNESS = 4;
const CORNER_COLOR = '#C84B1A';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlayTop: {
    position: 'absolute',
    top: 48,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  frameWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: 16,
  },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: CORNER_COLOR,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: CORNER_COLOR,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: CORNER_COLOR,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: CORNER_COLOR,
    borderBottomRightRadius: 16,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  manualBtnText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
  },
  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  validatingText: { marginTop: 12, color: '#2B1A10', fontSize: 14 },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#2B1A10', marginBottom: 8 },
  resultMsg: {
    fontSize: 14,
    color: '#6B5B4A',
    textAlign: 'center',
    marginBottom: 16,
  },
  patrocRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  patrocLogo: { width: 28, height: 28, borderRadius: 4 },
  patrocNameResult: { fontSize: 14, fontWeight: '700', color: '#6B1E1E' },
  resultCode: {
    fontFamily: 'Courier',
    fontSize: 20,
    fontWeight: '700',
    color: '#6B1E1E',
    letterSpacing: 2,
    marginBottom: 10,
  },
  resultDesc: {
    fontSize: 15,
    color: '#2B1A10',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 21,
  },
  resultHint: {
    fontSize: 12,
    color: '#6B5B4A',
    textAlign: 'center',
    marginBottom: 18,
    fontStyle: 'italic',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    width: '100%',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  secondaryBtnText: { color: '#2B1A10', fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#C84B1A',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700' },

  permWrap: {
    flex: 1,
    backgroundColor: '#FAF2E0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permTitle: { marginTop: 16, fontSize: 18, fontWeight: '700', color: '#2B1A10' },
  permMsg: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B5B4A',
    textAlign: 'center',
    lineHeight: 20,
  },
  permBtn: {
    marginTop: 22,
    backgroundColor: '#6B1E1E',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  permBtnText: { color: '#FFF', fontWeight: '700' },
  manualLink: { marginTop: 16 },
  manualLinkText: { color: '#6B1E1E', fontWeight: '600', textDecorationLine: 'underline' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#2B1A10', marginBottom: 4 },
  modalHint: { fontSize: 13, color: '#6B5B4A', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#E5DCC8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Courier',
    fontWeight: '700',
    letterSpacing: 2,
    color: '#6B1E1E',
    marginBottom: 16,
    textAlign: 'center',
  },
});

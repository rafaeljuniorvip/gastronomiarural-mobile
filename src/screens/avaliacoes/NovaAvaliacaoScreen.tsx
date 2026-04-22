import { useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, TextInput, Snackbar } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import StarRating from '../../components/avaliacoes/StarRating';
import {
  createAvaliacao,
  uploadAvaliacaoPhoto,
} from '../../services/avaliacao.service';
import { useAuth } from '../../contexts/AuthContext';

const MAX_PHOTOS = 3;
const MAX_COMMENT = 500;

type PhotoItem = {
  localUri: string;
  uploadedUrl?: string;
  uploading: boolean;
  error?: boolean;
};

export default function NovaAvaliacaoScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { user } = useAuth();

  const prato_id = route.params?.prato_id as number | undefined;
  const barraca_id = route.params?.barraca_id as number | undefined;
  const evento_id = route.params?.evento_id as number | undefined;
  const title = (route.params?.title as string | undefined) || 'Avaliar';

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  useLayoutEffect(() => {
    nav.setOptions({ title: `Avaliar ${title}`.trim() });
  }, [nav, title]);

  if (!user) {
    return (
      <View style={styles.authGate}>
        <Icon name="account-lock-outline" size={56} color="#6B1E1E" />
        <Text style={styles.gateTitle}>Faça login para avaliar</Text>
        <Text style={styles.gateMessage}>
          Sua avaliação ajuda outros visitantes a escolher melhor no festival.
        </Text>
        <Button
          mode="contained"
          buttonColor="#6B1E1E"
          style={styles.gateButton}
          onPress={() => nav.navigate('AccountTab')}
        >
          Entrar com Google
        </Button>
        <Button mode="text" textColor="#6B5B4A" onPress={() => nav.goBack()}>
          Voltar
        </Button>
      </View>
    );
  }

  async function pickImage() {
    if (photos.length >= MAX_PHOTOS) {
      setSnack(`Máximo de ${MAX_PHOTOS} fotos por avaliação`);
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos da sua permissão para acessar as fotos.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const photo: PhotoItem = { localUri: asset.uri, uploading: true };
    setPhotos((prev) => [...prev, photo]);

    try {
      const url = await uploadAvaliacaoPhoto(asset.uri);
      setPhotos((prev) =>
        prev.map((p) =>
          p.localUri === asset.uri ? { ...p, uploadedUrl: url, uploading: false } : p
        )
      );
    } catch (err: any) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.localUri === asset.uri ? { ...p, uploading: false, error: true } : p
        )
      );
      setSnack(err?.response?.data?.error || 'Erro ao enviar foto');
    }
  }

  function removePhoto(localUri: string) {
    setPhotos((prev) => prev.filter((p) => p.localUri !== localUri));
  }

  async function submit() {
    if (rating < 1) {
      setSnack('Escolha de 1 a 5 estrelas para enviar');
      return;
    }
    if (photos.some((p) => p.uploading)) {
      setSnack('Aguarde o upload das fotos');
      return;
    }
    const uploadedUrls = photos.filter((p) => p.uploadedUrl).map((p) => p.uploadedUrl!);

    setSubmitting(true);
    try {
      await createAvaliacao({
        prato_id,
        barraca_id,
        evento_id,
        rating,
        comment: comment.trim() || undefined,
        photos: uploadedUrls.length ? uploadedUrls : undefined,
      });
      setSnack('Avaliação enviada! Obrigado pelo seu feedback.');
      setTimeout(() => nav.goBack(), 900);
    } catch (err: any) {
      setSnack(err?.response?.data?.error || 'Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  }

  const labels = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FAF2E0' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.label}>Sua nota</Text>
          <View style={styles.stars}>
            <StarRating value={rating} onChange={setRating} size={42} />
          </View>
          {rating > 0 ? <Text style={styles.ratingLabel}>{labels[rating]}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Comentário (opcional)</Text>
          <TextInput
            mode="outlined"
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={(t) => t.length <= MAX_COMMENT && setComment(t)}
            placeholder="Conte como foi sua experiência…"
            style={styles.input}
            outlineColor="#E5DCC8"
            activeOutlineColor="#6B1E1E"
          />
          <Text style={styles.counter}>
            {comment.length}/{MAX_COMMENT}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>
            Fotos (opcional) · {photos.length}/{MAX_PHOTOS}
          </Text>
          <View style={styles.photosGrid}>
            {photos.map((p) => (
              <View key={p.localUri} style={styles.photoWrap}>
                <Image source={{ uri: p.localUri }} style={styles.photo} />
                {p.uploading ? (
                  <View style={styles.photoOverlay}>
                    <Icon name="cloud-upload-outline" size={20} color="#FFF" />
                  </View>
                ) : p.error ? (
                  <View style={[styles.photoOverlay, { backgroundColor: 'rgba(211,47,47,0.7)' }]}>
                    <Icon name="alert" size={20} color="#FFF" />
                  </View>
                ) : null}
                <TouchableOpacity
                  style={styles.photoRemove}
                  onPress={() => removePhoto(p.localUri)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="close" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < MAX_PHOTOS ? (
              <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
                <Icon name="camera-plus-outline" size={24} color="#6B1E1E" />
                <Text style={styles.addPhotoText}>Adicionar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <Button
          mode="contained"
          buttonColor="#6B1E1E"
          style={styles.submit}
          contentStyle={styles.submitContent}
          onPress={submit}
          disabled={submitting || rating < 1}
          loading={submitting}
        >
          Enviar avaliação
        </Button>
      </ScrollView>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack(null)}
        duration={3000}
      >
        {snack || ''}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  label: { fontSize: 13, fontWeight: '700', color: '#2B1A10', marginBottom: 10, letterSpacing: 0.3 },
  stars: { alignItems: 'center', paddingVertical: 8 },
  ratingLabel: { textAlign: 'center', color: '#C84B1A', fontWeight: '700', marginTop: 6 },
  input: { backgroundColor: '#FFF', minHeight: 110 },
  counter: { textAlign: 'right', fontSize: 11, color: '#6B5B4A', marginTop: 4 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoWrap: { width: 88, height: 88, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  photo: { width: 88, height: 88 },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 88,
    height: 88,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5DCC8',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF2E0',
  },
  addPhotoText: { fontSize: 11, color: '#6B1E1E', marginTop: 4, fontWeight: '600' },
  submit: { marginTop: 8, borderRadius: 8 },
  submitContent: { paddingVertical: 8 },
  authGate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FAF2E0',
  },
  gateTitle: { marginTop: 16, fontSize: 20, fontWeight: '700', color: '#2B1A10', textAlign: 'center' },
  gateMessage: { marginTop: 8, fontSize: 14, color: '#6B5B4A', textAlign: 'center', lineHeight: 20 },
  gateButton: { marginTop: 20, width: '100%' },
});

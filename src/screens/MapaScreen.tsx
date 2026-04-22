import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listMapaAll, type MapaAllItem } from '../services/mapa.service';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import CategoryChips, { type ChipOption } from '../components/ui/CategoryChips';

type FilterKey = 'all' | 'festival' | 'turismo';

const FILTER_OPTIONS: ChipOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'festival', label: 'Pontos do festival' },
  { value: 'turismo', label: 'Turismo' },
];

const CENTER_LAT = -20.4726;
const CENTER_LNG = -45.1269;
const DEFAULT_ZOOM = 15;

/**
 * Monta o HTML do mapa Leaflet injetando os pontos filtrados como JSON.
 * Renderizado dentro de uma WebView — funciona no Expo Go sem dev client.
 */
function buildHtml(points: MapaAllItem[]): string {
  const safePoints = points
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => ({
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      icon: p.icon,
      kind: p.kind,
      subtype: p.subtype,
    }));

  const pointsJson = JSON.stringify(safePoints).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
    body { background: #FAF7F2; -webkit-tap-highlight-color: transparent; }
    .gr-pin {
      background: #8B4513;
      color: #fff;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      white-space: nowrap;
      border: 2px solid #fff;
      text-align: center;
    }
    .gr-pin.turismo { background: #2E7D32; }
    .gr-pin.barraca { background: #C65D2E; }
    .leaflet-popup-content-wrapper { border-radius: 8px; }
    .leaflet-popup-content { font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; margin: 10px 12px; }
    .leaflet-popup-content b { color: #2B2B2B; }
    .gr-popup-subtype { color: #6B6B6B; font-size: 11px; text-transform: uppercase; margin-top: 4px; display: block; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    (function () {
      try {
        var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${CENTER_LAT}, ${CENTER_LNG}], ${DEFAULT_ZOOM});
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        var points = ${pointsJson};
        var bounds = [];
        points.forEach(function (p) {
          if (p.lat == null || p.lng == null) return;
          var cls = 'gr-pin ' + (p.kind || '');
          var icon = L.divIcon({
            html: '<div class="' + cls + '">' + p.icon + '</div>',
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
          var marker = L.marker([p.lat, p.lng], { icon: icon }).addTo(map);
          var popupHtml = '<b>' + (p.name || '') + '</b>' +
            '<span class="gr-popup-subtype">' + (p.subtype || p.kind || '') + '</span>';
          marker.bindPopup(popupHtml);
          bounds.push([p.lat, p.lng]);
        });

        // Expose recenter function for React Native to call via injectedJavaScript
        window.grRecenter = function () {
          map.setView([${CENTER_LAT}, ${CENTER_LNG}], ${DEFAULT_ZOOM});
        };

        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage('ready');
        }
      } catch (err) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage('error:' + (err && err.message ? err.message : 'unknown'));
        }
      }
    })();
  </script>
</body>
</html>`;
}

export default function MapaScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<MapaAllItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const webRef = useRef<WebView>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setItems(await listMapaAll());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar o mapa');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredPoints = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'festival') return items.filter((i) => i.kind === 'servico' || i.kind === 'barraca');
    if (filter === 'turismo') return items.filter((i) => i.kind === 'turismo');
    return items;
  }, [items, filter]);

  // Reconstrói o HTML toda vez que o filtro mudar.
  // Um novo HTML no `source` faz a WebView recarregar por completo — estratégia mais
  // simples e confiável do que injetar JS para atualizar markers individualmente.
  const html = useMemo(() => buildHtml(filteredPoints), [filteredPoints]);

  // Reset da flag mapReady quando recarrega o HTML
  useEffect(() => {
    setMapReady(false);
  }, [html]);

  const handleRecenter = useCallback(() => {
    webRef.current?.injectJavaScript('window.grRecenter && window.grRecenter(); true;');
  }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.filterWrap}>
        <CategoryChips
          options={FILTER_OPTIONS}
          value={filter}
          onChange={(v) => setFilter(v as FilterKey)}
        />
      </View>

      <View style={styles.mapWrap}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html }}
          style={styles.webview}
          onMessage={(event) => {
            const msg = event.nativeEvent.data;
            if (msg === 'ready') {
              setMapReady(true);
            } else if (msg.startsWith('error:')) {
              setError('Erro ao carregar o mapa: ' + msg.slice(6));
            }
          }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          startInLoadingState={false}
          // performance on Android
          mixedContentMode="always"
          allowsInlineMediaPlayback
        />

        {(loading || !mapReady) && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <Loading message="Carregando mapa..." />
          </View>
        )}

        {mapReady && (
          <TouchableOpacity
            style={styles.recenterBtn}
            onPress={handleRecenter}
            activeOpacity={0.8}
          >
            <Icon name="crosshairs-gps" size={18} color="#FFF" />
            <Text style={styles.recenterText}>Centralizar no festival</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  filterWrap: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0D5',
  },
  mapWrap: { flex: 1, position: 'relative' },
  webview: { flex: 1, backgroundColor: '#FAF7F2' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recenterBtn: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C65D2E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  recenterText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

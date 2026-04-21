# Festival Gastronomia Rural - Mobile (Expo)

App mobile (Expo Go) do Festival de Gastronomia Rural de Itapecerica.

- **API:** https://api.gastronomiarural.viptecnologia.com.br
- **Dev server Expo:** https://expo.gastronomiarural.viptecnologia.com.br
- **Repo web:** https://github.com/rafaeljuniorvip/gastronomiarural

## Desenvolvimento local

```bash
npm install --legacy-peer-deps
npm start
```

## Deploy no servidor (URL pública Expo Go)

```bash
./scripts/deploy.sh
```

Isso faz `rsync` do código para `ptbd01.viptecnologia.com.br:/opt/gastronomiarural-mobile` e reinicia o systemd `gastronomiarural-expo.service`.

Abra o Expo Go e escaneie o QR code de `https://expo.gastronomiarural.viptecnologia.com.br` (ou digite `exp://expo.gastronomiarural.viptecnologia.com.br` no Expo Go).

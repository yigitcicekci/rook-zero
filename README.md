# Chess Engine Test Suite

## 🚀 Özellikler

- **Gerçek Zamanlı Çoklu Oyuncu**: Socket.IO ile anlık çoklu oyuncu satranç
- **Redis Entegrasyonu**: Maç ve oyuncu durumlarının Redis'te saklanması
- **Gelişmiş Satranç Motoru**: Pin tespiti, en passant, rok gibi gelişmiş satranç kuralları
- **Kapsamlı Test Sistemi**: 96+ test ile eksiksiz satranç mantığı doğrulaması
- **Performans Analizi**: Detaylı performans metrikleri ve zamanlama analizi
- **Oyun Simülasyonu**: Otomatik oyun simülasyonu ve test araçları
- **Docker Desteği**: Docker ve Docker Compose desteği

## 📋 Gereksinimler

- Node.js 18+
- Redis 7+
- TypeScript 4.9+
- Jest (testing framework)
- Docker & Docker Compose (opsiyonel)

## 🛠️ Kurulum

### Local Kurulum

1. Dependencies'leri kurun:
```bash
npm install
```

2. Redis'i başlatın:
```bash
redis-server
```

3. Uygulamayı build edin:
```bash
npm run build
```

4. Development mode'da çalıştırın:
```bash
npm run dev
```

### Docker ile Kurulum

```bash
npm run docker:up
npm run docker:down
```

## 🧪 Test Suite

### Test Türleri ve Açıklamaları

#### 1. Simülasyon Test Paketleri
```bash
npm run test:all  # Tüm testleri çalıştır
```

**11 Test Paketi İçerir:**

##### Satranç Motoru Testleri (`chess-engine/__tests__/`)

- **Motor Testleri** (`engine.test.ts`)
  - ChessEngine yapıcı doğrulaması
  - Oyun durumu yönetimi
  - FEN notasyonu ayrıştırması
  - Temel hamle doğrulaması

- **Taş Hareketi Testleri**
  - `knight.test.ts`: At'ın L-şeklinde hareket doğrulaması
  - `queen.test.ts`: Vezir'in çapraz/düz hareket testi
  - `king.test.ts`: Şah hareketi + rok mantığı
  - `rook.test.ts`: Kale'nin düz çizgi hareketi
  - `bishop.test.ts`: Fil'in çapraz hareket testi
  - `pawn.test.ts`: Piyon ileri/yakalama/en passant testleri

- **Özel Kurallar Testleri** (`special-rules.test.ts`)
  - Rok (kısa/uzun rok)
  - En passant yakalama
  - Piyon terfi etme
  - Şah/mat tespiti

- **Kritik Satranç Mantığı** (`critical-chess-logic.test.ts`)
  - Pin tespiti (şah tehlikesine neden olan taşların hareketi engellenir)
  - Şah güvenliği doğrulaması
  - Karmaşık tahta senaryoları

- **Maç Senaryoları** (`match-scenarios.test.ts`)
  - Gerçek oyun durumu testleri
  - Çoklu hamle dizileri

#### 2. Performans ve Entegrasyon Testleri

##### Temel Test Paketi
```bash
npx ts-node src/tests/basicTest.ts
```

**Test Edilen Fonksiyonlar:**
- ✅ Redis bağlantısı (ping/pong)
- ✅ Maç oluşturma (UUID üretimi)
- ✅ Oyuncu katılımı (beyaz/siyah atama)
- ✅ Hamle doğrulaması (e2-e4 piyon hamlesi)
- ✅ Sistem istatistikleri (maç sayıları)
- ✅ Temizlik işlemleri (maç silme)


##### Chess Engine Validator
```bash
npx ts-node src/tests/chessEngineValidator.ts
```

**Gelişmiş Performans Analizi:**
- Bireysel hamle zamanlaması (doğrulama vs yürütme)
- Satranç mantığı uç durum testleri
- FEN notasyonu tutarlılığı
- Sıra yönetimi doğrulaması

##### X&Y Kullanıcı Kapsamlı Testi
```bash
npm run test:xy-users
```

**Gerçek Dünya Senaryosu Testleri:**
- Socket bağlantısı kurulumu
- Maç oluşturma ve katılma akışı
- İtalyan Oyunu açılış hamleleri (e4, e5, Nf3, Nc6, Bc4, Be7, O-O)
- Uç durumlar (geçersiz hamleler, yanlış sıralar)
- Oyuncu bağlantı kesme/yeniden bağlanma senaryoları
- Yük altında performans

##### Interactive Chess Test
```bash
npx ts-node src/tests/interactiveChessTest.ts
```

**Çift Modlu Test Sistemi:**
- **Mod 1**: Yerel Motor (tek terminal, 2 oyuncu sırayla)
- **Mod 2**: Ağ Çoklu Oyuncu (Redis/Socket.IO ile 2 istemci)

**Özellikler:**
- 🎮 İki oyuncu birbirine karşı oynayabilir
- 🕹️ ASCII tahta gösterimi ile gerçek zamanlı hamle girişi
- ⏱️ Canlı performans metrikleri (doğrulama/yürütme zamanlaması)
- 📊 Kapsamlı hata takibi ve analizi
- 🎯 Üretim ortamı simülasyonu
- 📈 Başarı oranı izleme
- 🌐 Socket.IO entegrasyonu ve FEN ayrıştırması

**Kullanılabilir Komutlar:**
```
🎯 Player 1 (white), your move: e2-e4    # Make a move
🎯 Player 1 (white), your move: stats    # Show performance stats
🎯 Player 1 (white), your move: board    # Redraw board
🎯 Player 1 (white), your move: history  # Show move history
🎯 Player 1 (white), your move: help     # Show commands
🎯 Player 1 (white), your move: quit     # Exit game
```

### Test Yürütme Sırası
```bash
npm run test:all                              # Simülasyon testleri için
npm test                                      # Jest paketi (96 test)
npx ts-node src/tests/basicTest.ts           # Temel fonksiyonalite
npx ts-node src/tests/chessEngineValidator.ts # Satranç mantığı doğrulaması
npm run test:xy-users                        # Entegrasyon testi
npx ts-node src/tests/interactiveChessTest.ts # Etkileşimli oyun testi
```

## 🎮 Kullanım

### Server Başlatma

```bash
# Development
npm run dev

# Production  
npm start
```

Server `http://localhost:3001` adresinde çalışacaktır.

### API Uç Noktaları
- `GET /api/stats` - Sistem istatistikleri (maçlar, oyuncular)
- `GET /api/matches/pending` - Bekleyen maçlar
- `GET /api/matches/:matchId` - Maç detayları

### Socket.IO Events

#### İstemciden Sunucuya
- `identify` - Oyuncu kimlik doğrulaması
- `create_match` - Yeni maç oluşturma
- `join_match` - Maça katılma
- `make_move` - Hamle yapma
- `resign` - Oyundan çekilme

#### Sunucudan İstemciye
- `match_created` - Yeni maç oluşturuldu
- `match_started` - Maç başladı
- `move_made` - Hamle yapıldı
- `player_joined` - Oyuncu katıldı
- `game_over` - Oyun bitti

## 📊 Performans Metrikleri

### Satranç Motoru Performansı
- **Milisaniye Altı**: Ortalama hamle işleme süresi (0.40-1.50ms)
- **Pin Tespiti**: Şahı tehlikeye atan geçersiz hamleleri engeller
- **Bellek Verimli**: 32 taş takip sistemi
- **FEN Uyumlu**: Standart satranç notasyonu desteği
- **Mat Tespiti**: Otomatik şah/mat/pat durumu algılama

### Sistem Performansı
- **Redis İşlemleri**: ~7ms bağlantı süresi
- **Socket Bağlantıları**: ~6.54ms ortalama
- **Hamle Doğrulaması**: ~0.17ms ortalama
- **Ağ Gecikmesi**: ~1000ms simüle edilmiş gerçekçi gecikmeler

### Başarı Oranları
- **Hamle Başarı Oranı**: %75 (geçersiz hamleler için beklenen başarısızlıklar)
- **Bağlantı Güvenilirliği**: Test senaryolarında %100
- **Sıra Yönetimi**: %100 doğruluk

## 🏗️ Proje Yapısı

```
├── src/
│   ├── services/
│   │   ├── redis.ts          # Redis servisi (bağlantı yönetimi)
│   │   └── matchManager.ts   # Maç yaşam döngüsü yönetimi
│   ├── socket/
│   │   └── socketHandler.ts  # Socket.IO olay işleyicisi
│   ├── types/
│   │   └── game.ts          # TypeScript tip tanımları
│   ├── tests/
│   │   ├── basicTest.ts     # Temel fonksiyonalite testleri
│   │   ├── chessEngineValidator.ts  # Satranç mantığı doğrulaması
│   │   ├── xyUserTest.ts    # Entegrasyon ve kullanıcı simülasyonu
│   │   └── interactiveChessTest.ts  # Etkileşimli test sistemi
│   └── server.ts            # Express + Socket.IO sunucusu
├── chess-engine/            # Satranç motoru implementasyonu
│   ├── engine.ts            # Ana motor sınıfı
│   ├── pieces/             # Taş hareket mantığı
│   └── __tests__/          # Jest test dosyaları
├── docker-compose.yml       # Docker compose yapılandırması
├── Dockerfile              # Docker image yapılandırması
└── package.json
```

## 🔧 Environment Variables

```bash
NODE_ENV=development
PORT=3000
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=*
```

## 🚀 Deployment

### Docker Production

```bash
docker-compose -f docker-compose.yml up -d
```

### Yaygın Sorunlar

1. **Port Zaten Kullanımda**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Redis Bellek Dolu**
   ```bash
   redis-cli FLUSHALL
   ```

3. **TypeScript Derleme Hataları**
   ```bash
   npx tsc --noEmit
   ```

## 📈 Test Sonuçları Özeti

### Son Test Çalıştırma Sonuçları:
- ✅ **96/96 Jest Testi Başarılı**
- ✅ **Tüm Entegrasyon Testleri Başarılı**
- ✅ **Performans Kriterlerini Karşılıyor**
- ✅ **Satranç Mantığı Doğrulaması Tamamlandı**
- ✅ **Linter Hatası Yok**



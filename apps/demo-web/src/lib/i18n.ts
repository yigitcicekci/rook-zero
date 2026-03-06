export type Lang = 'en' | 'tr';

export const t = {
  en: {
    nav: {
      playground: 'Playground',
      api: 'API'
    },
    footer: {
      released: 'Released under the MIT License.'
    },
    hero: {
      badge: 'v1.0.1 is live',
      title1: 'Strict Chess Rules.',
      title2: 'Zero Compromises.',
      subtitle: 'A robust TypeScript chess library for legal move generation, strict FEN/SAN/UCI validation, and Elo rating calculation. Built for scale, with zero dependencies.',
      cta1: 'Try the Playground',
      cta2: 'View API'
    },
    features: {
      title: 'Core Capabilities',
      subtitle: 'Everything you need to build chess applications, backends, and study tools.',
      items: [
        { title: 'Strict Validation', desc: 'Thorough checks for FEN, moves, and board states. Prevents illegal moves, bad casts, and weird piece placements at the root level.' },
        { title: 'Move Generation', desc: 'Complete legal move generation including en passant, castling, promotion, and check evasions.' },
        { title: 'Notation Mastery', desc: 'First-class support for SAN, UCI, PGN, and FEN. Move effortlessly between robust formats.' },
        { title: 'Game State Detection', desc: 'Detects checkmate, stalemate, draw by insufficient material, and 50-move/repetition rules.' },
        { title: 'Elo Helpers', desc: 'Built-in utilities to calculate Elo changes, expected scores, and FIDE K-factors for match logic.' },
        { title: 'State History', desc: 'Robust undo/redo stack that tracks captured pieces, castling rights, and clock counters accurately.' }
      ]
    },
    api: {
      title: 'API Highlights',
      subtitle: 'Clean, predictable, and fully typed public API designed for developer experience.',
      snippets: [
        { id: 'init', title: 'Initialize & Move', desc: 'Create an engine and make valid moves via SAN or UCI.' },
        { id: 'validate', title: 'Strict Validation', desc: 'Validate positions and moves before playing them.' },
        { id: 'elo', title: 'Elo Rating Helpers', desc: 'Calculate score expectations and rating changes.' }
      ]
    },
    useCases: {
      title: 'Why Use Rook Zero?',
      subtitle: 'Unlike other libraries that carry heavy dependencies or try to do too much, Rook Zero focuses purely on the rules, state, and notation of chess. It is designed to be embedded in both serverless backends and modern frontends with zero overhead.',
      items: [
        "Chess App Frontends (React, Vue, Native) requiring reliable local move generation",
        "Backend Move Validation Services ensuring game integrity",
        "Study & Analysis Tools processing PGN databases and engine outputs",
        "Notation Conversion Tools (SAN <-> UCI <-> FEN)",
        "Custom Chess Variants and rule prototypes",
        "Elo Rating and matchmaking workflows"
      ],
      installation: '// Installation',
      zeroDep: 'Zero Dependencies',
      typed: 'Fully Typed (TypeScript)',
      license: 'MIT License'
    },
    playground: {
      title: 'Interactive Playground',
      status: 'Game Status',
      turn: 'Turn',
      white: 'White',
      black: 'Black',
      state: 'State',
      checkmate: 'Checkmate',
      stalemate: 'Stalemate',
      check: 'Check',
      draw: 'Draw',
      normal: 'Normal',
      gameOver: 'Game Over',
      validation: 'Validation & Actions',
      movePlaceholder: 'Enter SAN or UCI (e.g. e4, Nf3, e2e4)',
      moveBtn: 'Move',
      fenPlaceholder: 'Load FEN...',
      fenBtn: 'Load FEN',
      presets: 'Preset Scenarios:',
      presetNames: {
        'Start Position': 'Start Position',
        'Checkmate': 'Checkmate',
        'Stalemate': 'Stalemate',
        'Promotion': 'Promotion',
        'En Passant': 'En Passant',
        'Threefold': 'Threefold'
      },
      export: 'Export & History',
      currentFen: 'Current FEN',
      moveHistory: 'Move History',
      noMoves: 'No moves yet',
      pgn: 'PGN',
      empty: 'Empty',
      msgs: {
        moveApplied: 'Move applied.',
        invalidMove: 'Invalid move:',
        fenLoaded: 'FEN loaded successfully.',
        invalidFen: 'Invalid FEN:'
      }
    }
  },
  tr: {
    nav: {
      playground: 'Oyun Alanı',
      api: 'API'
    },
    footer: {
      released: 'MIT Lisansı altında yayınlanmıştır.'
    },
    hero: {
      badge: 'v1.0.1 yayında',
      title1: 'Satranç Kurallarını Takip Et.',
      title2: 'Sıfır Taviz.',
      subtitle: 'Legal hamle üretimi, sıkı FEN/SAN/UCI doğrulaması ve Elo hesaplamaları için sağlam bir TypeScript satranç kütüphanesi. Ölçeklenebilir, sıfır bağımlılık.',
      cta1: 'Oyun Alanını Deneyin',
      cta2: 'API\'yi İncele'
    },
    features: {
      title: 'Temel Özellikler',
      subtitle: 'Satranç uygulamaları, backend servisleri ve analiz araçları geliştirmek için ihtiyacınız olan her şey.',
      items: [
        { title: 'Doğrulama (Validation)', desc: 'FEN, hamleler ve tahta durumları için kapsamlı kontroller. İllegal hamleleri, hatalı rok denemelerini en alt düzeyde engeller.' },
        { title: 'Hamle Üretimi', desc: 'En passant, rok, terfi ve şah kurtulma hamleleri dahil eksiksiz legal hamle üretimi (Move generation).' },
        { title: 'Notasyon Hakimiyeti', desc: 'SAN, UCI, PGN ve FEN için birinci sınıf destek. Sağlam formatlar arasında zahmetsizce geçiş yapın.' },
        { title: 'Oyun Durumu Tespiti', desc: 'Mat, pat, yetersiz materyal beraberliği, 50 hamle kuralı ve üçlü tekrar tespiti.' },
        { title: 'Elo Hesaplamaları', desc: 'Elo değişimlerini, beklenen skorları ve maç mantığı için FIDE K-faktörlerini hesaplayan yerleşik araçlar.' },
        { title: 'Geçmiş Yönetimi', desc: 'Yakalanan taşları, rok haklarını ve hamle sayaçlarını doğru şekilde takip eden sağlam bir undo/redo yığını.' }
      ]
    },
    api: {
      title: 'API Özellikleri',
      subtitle: 'Geliştirici deneyimi için tasarlanmış temiz, öngörülebilir ve tamamen tiplendirilmiş (fully typed) public API.',
      snippets: [
        { id: 'init', title: 'Başlat & Hamle Yap', desc: 'Engine oluştur ve SAN veya UCI ile geçerli hamleler yap.' },
        { id: 'validate', title: 'Sıkı Doğrulama', desc: 'Pozisyonları ve hamleleri oynamadan önce doğrula.' },
        { id: 'elo', title: 'Elo Hesaplamaları', desc: 'Skor beklentilerini ve reyting değişimlerini hesapla.' }
      ]
    },
    useCases: {
      title: 'Neden Rook Zero?',
      subtitle: 'Ağır bağımlılıklar taşıyan veya çok fazla şey yapmaya çalışan diğer kütüphanelerin aksine Rook Zero, tamamen satrancın kurallarına, durumuna ve notasyonuna odaklanır. Sıfır yük ile hem serverless backend\'lere hem de modern frontend\'lere entegre edilmek üzere tasarlanmıştır.',
      items: [
        "Güvenilir yerel hamle üretimine ihtiyaç duyan Satranç Frontend'leri (React, Vue, Native)",
        "Oyun bütünlüğünü sağlayan Backend Hamle Doğrulama Servisleri",
        "PGN veritabanlarını ve motor çıktılarını işleyen Analiz Araçları",
        "Notasyon Dönüştürme Araçları (SAN <-> UCI <-> FEN)",
        "Özel Satranç Varyantları ve kural prototipleri",
        "Elo Reyting ve eşleştirme (matchmaking) iş akışları"
      ],
      installation: '// Kurulum',
      zeroDep: 'Sıfır Bağımlılık',
      typed: 'Tam Tipli (TypeScript)',
      license: 'MIT Lisanslı'
    },
    playground: {
      title: 'Oyun Alanı',
      status: 'Oyun Durumu',
      turn: 'Sıra',
      white: 'Beyaz',
      black: 'Siyah',
      state: 'Durum',
      checkmate: 'Mat',
      stalemate: 'Pat',
      check: 'Şah',
      draw: 'Berabere',
      normal: 'Normal',
      gameOver: 'Oyun Bitti',
      validation: 'Doğrulama & Eylemler',
      movePlaceholder: 'SAN veya UCI girin (örn. e4, Nf3, e2e4)',
      moveBtn: 'Oyna',
      fenPlaceholder: 'FEN yükle...',
      fenBtn: 'FEN Yükle',
      presets: 'Hazır Senaryolar:',
      presetNames: {
        'Start Position': 'Başlangıç',
        'Checkmate': 'Mat',
        'Stalemate': 'Pat',
        'Promotion': 'Terfi',
        'En Passant': 'Geçerken Alma',
        'Threefold': 'Üçlü Tekrar'
      },
      export: 'Dışa Aktar & Geçmiş',
      currentFen: 'Mevcut FEN',
      moveHistory: 'Hamle Geçmişi',
      noMoves: 'Henüz hamle yok',
      pgn: 'PGN',
      empty: 'Boş',
      msgs: {
        moveApplied: 'Hamle uygulandı.',
        invalidMove: 'Geçersiz hamle:',
        fenLoaded: 'FEN başarıyla yüklendi.',
        invalidFen: 'Geçersiz FEN:'
      }
    }
  }
};

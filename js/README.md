# Oyun kodu mimarisi

Oyun şu an derleme aracı gerektirmeyen klasik tarayıcı scriptleriyle çalışır. Mevcut inline HTML olayları ve oyun davranışları korunurken bağımsız alanlar `js/` altına ayrılmıştır.

## Dosyalar

- `game-config.js`: her yeni oyun için varsayılan state değerlerini üretir.
- `game-modules.js`: yeni özelliklerin kurulum, kare güncellemesi ve temizleme yaşam döngüsünü yönetir.
- `ui.js`: HUD, görev göstergesi, modal ve bildirimler.
- `audio.js`: Web Audio ses efektleri.
- `input.js`: dokunmatik joystick, kamera, klavye ve aksiyon butonları.
- `../2.html`: mevcut Three.js dünya, varlıklar ve oyun mekaniğinin ana çekirdeği. Davranış riski yaratmamak için henüz tek parça olan bu alanlar yeni modüllere ihtiyaç oldukça taşınabilir.

## Özellik ekleme

1. `js/` altında özelliğe özel bir dosya oluştur.
2. Özelliği `GameModules.register` ile kaydet.
3. Dosyanın script etiketini `2.html` içindeki ana inline oyun scriptinden sonra ve `</body>` etiketinden önce ekle.
4. Sahneye eklenen nesneleri veya olay dinleyicilerini `dispose` içinde temizle.

```js
GameModules.register('example-feature', {
    setup({ state, scene, actions }) {
        // Özelliğin başlangıç kaynaklarını burada oluştur.
    },
    update({ state, scene, player }, deltaTime, elapsedTime) {
        // Kare başına gereken güncellemeleri burada yap.
    },
    dispose({ scene }) {
        // Özelliğe ait nesneleri ve dinleyicileri kaldır.
    }
});
```

`setup` ve `update` bağlamındaki `state`, `scene`, `camera`, `renderer`, `player`, adlandırılmış `world` nesneleri, model `factories` ve ortak `actions` ana oyun tarafından sağlanır. `update` mevcut oyun döngüsünden sonra çağrılır. Modüller yüklenme sırasıyla çalışır; oyun başladıktan sonra kaydedilen modülün `setup` işlevi hemen çalışır.

# 🚀 FUI Designer - Çalıştırma Talimatları

## ✅ **Son Güncelleme: LocalStorage Auto-Save Eklendi!**

**💾 Yeni Özellik:**
- ✅ **Auto-Save**: Tüm değişiklikler otomatik kaydediliyor
- ✅ **Page Refresh Persistence**: Sayfa yenilendiğinde proje kaybolmuyor
- ✅ **Workspace State Recovery**: Seçili workspace ve layer korunuyor

**🔧 Eklenen Özellikler:**
- ✅ **Pen Tool (Kalem)**: Serbest çizim yapabilirsiniz
- ✅ **Text Tool**: Metin ekleme ve düzenleme
- ✅ **Gelişmiş Properties Panel**: 
  - Position & Size (X, Y, Width, Height)
  - Appearance (Fill, Stroke, Stroke Width, Opacity)
  - Text Properties (Text, Font Size, Font Family, Bold/Italic, Align)
  - Line Properties (Line Cap, Line Join)

**🎨 Aktif Araçlar:**
- Select Tool (V) - Katman seçimi
- Move Tool (M) - Katman taşıma  
- Rectangle Tool (R) - Dikdörtgen çizimi
- Circle Tool (O) - Daire çizimi
- **Pen Tool (P) - Serbest çizim** ✨
- **Text Tool (T) - Metin ekleme** ✨

## 📋 Hızlı Başlangıç

### 1. Frontend Çalıştırma
```bash
cd frontend
npm run dev
```

**⚠️ Önemli:** Server çalıştıktan sonra tarayıcınızda `http://localhost:5173` adresini açın.

### 2. Backend Çalıştırma (İsteğe Bağlı)
```bash
cd backend
python app.py
```

## 🎯 Test Senaryoları

### ✅ **İlk Workspace Otomatik Açılması**
1. Uygulamayı açın → Başlangıç ekranı gelir
2. Herhangi bir şablonu seçin veya custom project oluşturun
3. "Create Project" butonuna tıklayın
4. **Beklenen:** Ana workspace otomatik olarak oluşturulur ve seçilir

### ✅ **Workspace Seçim Özelliği**
1. Workspace'ler arası geçiş yapmak için üst sekmeleri kullanın
2. Canvas'ta workspace'lere tıklayarak seçim yapın
3. **Beklenen:** Seçili workspace mavi kenarlıkla belirtilir

### ✅ **Çizim Araçları**
1. Sol panelden Rectangle veya Circle aracını seçin
2. Workspace içinde tıklayıp sürükleyin
3. **Beklenen:** Şekil oluşturulur ve katman panelinde görünür

### ✅ **Renk Değişikliği**
1. Bir katman seçin
2. Sol paneldeki Stroke veya Fill renklerini değiştirin
3. **Beklenen:** Seçili katmanın renkleri güncellenir

## 🐛 Sorun Giderme

### Workspace Görünmüyorsa:
- Browser console'u açın (F12)
- Hata mesajlarını kontrol edin
- Sayfayı yenileyin (Ctrl+F5)

### Çizim Çalışmıyorsa:
- Sol panelden doğru aracı seçtiğinizden emin olun
- Workspace içinde çizim yaptığınızdan emin olun

### Seçim Çalışmıyorsa:
- Selection tool'un seçili olduğundan emin olun
- Canvas'ta doğru yere tıkladığınızdan emin olun

## 📱 Tarayıcı Uyumluluğu

- ✅ Chrome 80+
- ✅ Firefox 70+
- ✅ Safari 13+
- ✅ Edge 80+

## 🔧 Geliştirme Notları

Sorun yaşarsanız:

1. **Console Hatalarını Kontrol Edin**
2. **Network Sekmesini Kontrol Edin**
3. **Kaynak kodunda TypeScript hatalarını kontrol edin**

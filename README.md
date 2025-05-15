# PitchSmith

PitchSmith, kullanıcıların ikna becerilerini değerlendiren ve geliştiren bir Telegram botu uygulamasıdır. Kullanıcılar, projelerini veya fikirlerini 60 saniye içinde sunarak ikna yeteneklerini test edebilir ve detaylı geri bildirim alabilirler.

## Özellikler

- **60 Saniyelik İkna Süresi**: Kullanıcılara fikirlerini sunmaları için 60 saniyelik bir süre verilir.
- **Kapsamlı Değerlendirme**: Sunumlar netlik, kanıt kullanımı, duygusal bağlantı, itirazları ele alma ve genel etki gibi kriterlere göre değerlendirilir.
- **Detaylı Geri Bildirim**: Kullanıcılara güçlü yönleri ve geliştirilebilecek alanları hakkında detaylı geri bildirim verilir.
- **Puanlama Sistemi**: Sunumlar 0-100 arası bir puanlama sistemi ile değerlendirilir.
- **Yerel Veri Saklama**: Değerlendirme sonuçları yerel bir JSON dosyasında saklanır.
- **Google Sheets Entegrasyonu**: İsteğe bağlı olarak, değerlendirme sonuçları Google Sheets'e kaydedilebilir.

## Kurulum

1. Repo'yu klonlayın:
   ```
   git clone https://github.com/kullaniciadi/pitchsmith.git
   cd pitchsmith
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. Telegram Bot Token'ınızı ayarlayın:
   - `.env` dosyası oluşturun ve aşağıdaki değişkeni ekleyin:
     ```
     TELEGRAM_BOT_TOKEN=your_telegram_bot_token
     ```

4. (İsteğe Bağlı) Google Sheets entegrasyonu için:
   - Google Cloud Console'dan bir servis hesabı oluşturun
   - Servis hesabı kimlik bilgilerini `service-account.json` olarak kaydedin
   - Google Sheets belgesine servis hesabı için erişim izni verin
   - `src/mastra/services/googleSheetsService.ts` dosyasında `SPREADSHEET_ID` değişkenini güncelleyin

5. Uygulamayı başlatın:
   ```
   npm run dev
   ```

## Kullanım

1. Telegram'da @PitchSmithBot ile konuşmaya başlayın
2. Bot size ikna etmeye çalışacağınız bir konu seçmenizi isteyecek
3. Fikrinizi veya projenizi 60 saniye içinde sunun
4. Bot, sunumunuzu değerlendirecek ve size detaylı geri bildirim verecek

## Teknolojiler

- Node.js
- TypeScript
- Mastra Framework
- Telegram Bot API
- Google Sheets API (isteğe bağlı)

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

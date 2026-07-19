# 🍽️ POS-SYSTEM & Kitchen App: Loyiha Tahlili (Project Analysis)

Ushbu hujjat **Kitchen/POS-SYSTEM** loyihasining Frontend va Backend qismlari arxitekturasi, texnologiyalari, ma'lumotlar bazasi modellari va mavjud imkoniyatlarini batafsil tahlil qiladi. Ushbu ma'lumotlarni ChatGPT'ga ulashish orqali yangi funksiyalar qo'shish, refactoring qilish yoki kelajakdagi rivojlanish rejalarini muhokama qilishingiz mumkin.

---

## 📁 1. Loyiha Tuzilishi (Project Directory Structure)

Loyiha ikkita asosiy qismdan iborat:
*   `amaliyot-front` (Frontend): Foydalanuvchi interfeysi (POS, Oshxona, Dashboard, Sozlamalar).
*   `amaliyot-back` (Backend): REST API server, ma'lumotlar bazasi boshqaruvi va integratsiyalar.

---

## 💻 2. Frontend Tahlili (`amaliyot-front`)

### 🛠️ Texnologiyalar (Tech Stack)
*   **Karkas**: Vue 3 (Composition API / Options API), Vite (tezkor yig'uvchi).
*   **Routing**: `vue-router` (sahifalararo navigatsiya).
*   **Dizayn va Stil**: Tailwind CSS v4.0.0+ (zamonaviy to'q rangli mavzu / Premium UI).
*   **Ikonkalar**: `lucide-vue-next`.
*   **HTTP Mijoz**: `axios` (API so'rovlari va offline interceptorlar).
*   **Ko'p Platformalilik (Cross-platform)**:
    *   **Electron**: Desktop dastur ko'rinishida yig'ish (macOS va Windows targetlari sozlangam).
    *   **Capacitor**: Mobil ilova (Android va iOS) sifatida yig'ish va qurilma funksiyalaridan foydalanish.

### 🔑 Asosiy Imkoniyatlar (Key Features)

#### ⚡ Offline-First (Tarmoqsiz Ishlash Tizimi)
*   **GET So'rovlarni Keshlash**: Barcha muvaffaqiyatli GET so'rovlar natijalari `localStorage`da saqlanadi (`cache_[url]` kaliti ostida). Tarmoq o'chganda ma'lumotlar keshdan o'qiladi.
*   **Yozish So'rovlarini Navbatga Qo'yish (Offline Queue)**: POST, PUT, DELETE, PATCH so'rovlari internet yo'qligida rad etilmaydi, balki `offline_requests_queue` navbatiga yoziladi. Foydalanuvchiga muvaffaqiyatli yakunlangani haqida soxta (mock) javob qaytariladi, bu esa interfeysni to'xtab qolmasligini ta'minlaydi.
*   **Avtomatik Sinxronizatsiya (Auto-Sync & Ping)**: Har 8 soniyada fonda `/health` endpointi orqali internet tekshiriladi. Aloqa tiklanishi bilan navbatdagi barcha yozish so'rovlari ketma-ket serverga yuboriladi va kesh yangilanadi.
*   **Audio Bildirishnomalar (Web Audio API)**: Ilova harakatlarida (Muvaffaqiyat, Ogohlantirish, Xato) brauzer ichki audio tizimi orqali dinamik ohanglar chaladi (chime sounds).

#### 🛒 POS Terminal & Buyurtmalar
*   **Stollar Layout-i**: Restoran zallari va stollarini vizual boshqarish (bo'sh/band/band qilingan stollar holati).
*   **Buyurtma Turlari**: DINE_IN (Zalda), TAKE_AWAY (Olib ketish), DELIVERY (Etkazib berish).
*   **Savatcha va To'lov**: Savatchaga mahsulotlarni oson qo'shish, sonini o'zgartirish, chegirmalarni hisoblash, naqd/karta/mobil to'lov turlarini tanlash.
*   **Chek Chop Etish**: Chop etish konfiguratsiyalari.

#### 🍳 Oshxona Terminali (Chef KDS)
*   Faol buyurtmalarni ko'rish va tayyorlash jarayonlarini boshqarish (`ACCEPTED` -> `PREPARING` -> `READY`).
*   Tayyorlangan buyurtmalar tarixini ko'rish.

#### 📊 Dashboard va Boshqaruv sahifalari
*   Statistika, to'lov usullari ulushi, mashhur mahsulotlar va tushum tahlili.
*   Foydalanuvchilar (PIN-kodlar orqali tezkor kirish: Superadmin, Manager, Cashier, Waiter, Chef).
*   Mahsulotlar va Kategoriyalar, Mijozlar va Filiallarni boshqarish.

---

## ⚙️ 3. Backend Tahlili (`amaliyot-back`)

### 🛠️ Texnologiyalar (Tech Stack)
*   **Ishga tushirish muhiti**: Node.js, Express (TypeScript yordamida yozilgan).
*   **Ishlab chiqish vositasi**: `tsx` (TypeScript fayllarini hot-reload bilan ishga tushirish).
*   **Ma'lumotlar bazasi**: MongoDB (ODM: `mongoose`).
*   **Hujjatlashtirish**: Swagger UI (`swagger-jsdoc` & `swagger-ui-express` orqali `/api-docs` sahifasida).

### 📐 Arxitektura Patternlari (Design Patterns)
*   **Prisma-like Mongoose Wrapper**: Mongoose modeli ustidan maxsus `createModelWrapper` yozilgan. U yordamida MongoDB so'rovlari Prisma ORM sintaksisiga o'xshash qilib yoziladi (`findMany`, `findUnique`, `create`, `update`, `delete` va `count`).
*   **Router -> Controller -> Model**: Har bir model uchun alohida route va controller fayllari yozilgan.
*   **Soft Delete**: `is_deleted: Boolean` va `deleted_at: Date` fieldlari orqali ma'lumotlarni bazadan o'chirmasdan yashirish (Soft Delete) qo'llangan.

### 🗄️ Database Modellari (Database Schemas)
Loyiha quyidagi ma'lumotlar bazasi modellariga ega:

1.  **Branch (Filial)**: `name`, `address`, `phone`.
2.  **User (Xodimlar)**: `first_name`, `password` (PIN-kod), `role` (`SUPERADMIN`, `MANAGER`, `CASHIER`, `WAITER`, `CHEF`), `phone`, `branch_id`.
3.  **Category (Kategoriyalar)**: `name`, `branch_id`.
4.  **Product (Mahsulotlar)**: `name`, `price`, `cost_price` (tannarxi), `image`, `category_id`, `branch_id`.
5.  **RestaurantTable (Stollar)**: `table_number`, `seats` (sig'imi), `room_name` (zal nomi), `status` (`AVAILABLE`, `OCCUPIED`, `RESERVED`), `branch_id`.
6.  **Order (Buyurtmalar)**: `branch_id`, `table_id`, `customer_id`, `waiter_id`, `discount_id`, `source` (`DINE_IN`, `TAKEAWAY`, `DELIVERY`), `order_type` (`STANDARD`, `EXPRESS`), `status` (`PENDING`, `ACCEPTED`, `PREPARING`, `READY`, `SERVED`, `COMPLETED`, `CANCELLED`), `total_amount`, `discount_amount`, `final_amount`, `notes`.
7.  **OrderItem (Buyurtma tarkibi)**: `order_id`, `product_id`, `quantity`, `price`, `total_price`, `status`.
8.  **Payment (To'lovlar)**: `order_id`, `amount`, `payment_method` (`CASH`, `CARD`, `MOBILE`), `status`, `transaction_id`.
9.  **ShiftSession (Smena yopilishi)**: `user_id`, `branch_id`, `start_time`, `end_time`, `status`, `opening_balance`, `closing_balance`.
10. **Expense (Xarajatlar)**: `branch_id`, `amount`, `category`, `description`, `date`.
11. **Inventory (Ombor/Zaxira)**: `product_id`, `quantity`, `min_quantity`, `unit` (dona/kg).
12. **StockMovement (Ombor harakatlari)**: `product_id`, `quantity`, `type` (`IN`, `OUT`), `reason`, `user_id`, `date`.
13. **Discount (Chegirmalar)**: `code`, `type` (foiz yoki summa), `value`, `is_active`.
14. **Printer (Printerni sozlash)**: `name`, `ip_address`, `port`, `type` (thermal/kitchen).
15. **Notification (Bildirishnomalar)**: Xabarlar va ogohlantirishlar.
16. **AuditLog (Tizim loglari)**: Foydalanuvchilar harakatlari tarixi.

---

## 🚀 4. ChatGPT bilan muhokama qilish uchun takliflar (Suggested Features)

Ushbu tahlilni ChatGPT'ga berib, quyidagi yangiliklarni qanday qo'shishni so'rashingiz mumkin:

1.  **🔌 Real-Time WebSockets (Socket.io) Integratsiyasi**:
    *   Hozirda ilova har 8 soniyada so'rov yuborib turadi (polling).
    *   *Taklif*: Waiter buyurtma berganda Chef ekraniga darhol (real-time) tushishi va Chef tayyor qilganda POS'da darhol ogohlantirish chiqishi uchun Socket.io o'rnatish.
2.  **🖨️ ESC/POS Thermal Printing**:
    *   Electron yoki Capacitor orqali USB, Bluetooth yoki LAN printerlarga chek chop etish logikasini to'liq sozlash.
3.  **💳 Click/Payme/Uzum Integratsiyalari**:
    *   To'lov sahifasiga O'zbekistondagi mashhur to'lov tizimlari uchun QR-kod orqali to'lov qilish funksiyasini qo'shish.
4.  **📊 Z-Report va Smena Tizimi (Shift Session)**:
    *   Kassir smenani yopganda kassa hisob-kitobini tekshirish, farqlarni aniqlash va avtomatik Z-Hisobotni printerga chiqarish tizimini to'liq ishga tushirish.
5.  **📲 Mijozlar uchun QR-Menu**:
    *   Stol ustidagi QR kodni skanerlab mijozning o'zi buyurtma bera oladigan kichik veb-sahifa (Client Menu) yaratish va uni POS tizimiga ulash.
6.  **📈 Masalliqlar Sarfi (Recipe/Ingredient Management)**:
    *   Taom buyurtma qilinganda Inventory (ombordagi go'sht, un, kartoshka kabi xom-ashyolar) avtomatik kamayadigan kalkulyatsiya tizimini qo'shish.

# Loyiha Ma'lumotlari Tahlili (ChatGPT uchun kontekst)

Ushbu hujjat loyihaning frontend va backend qismidagi ma'lumotlar tuzilmasini va texnologik stekini ChatGPT'ga tez va oson tushuntirish uchun tayyorlangan. 

## 1. Umumiy Texnologiyalar (Tech Stack)
- **Backend**: Node.js, Express.js, TypeScript.
- **Ma'lumotlar bazasi**: PostgreSQL, Prisma ORM.
- **Frontend**: React.js (Vite), Tailwind CSS, Axios, React Router, Recharts (grafiklar uchun).
- **API Arxitekturasi**: REST API.

## 2. Ma'lumotlar Bazasi Tuzilmasi (Prisma Schema asosida)

Loyihada **Restoran / Oshxona boshqaruvi (Restaurant Management System)** tizimi qurilgan. Asosiy modellar (jadvallar) quyidagilar:

### Asosiy Modellar:
- **Branch (Filial)**: Barcha ma'lumotlar filialga bog'langan (`branch_id`).
- **User (Foydalanuvchilar/Xodimlar)**: Filial xodimlari. Rollari: `ADMIN`, `MANAGER`, `CASHIER`, `WAITER`, `CHEF`.
- **Category & Product (Menyu)**: Taomlar va ularning kategoriyalari. Narx (`price`) va tannarx (`cost_price`) mavjud.
- **Customer (Mijozlar)**: Mijozlar bazasi, ularning bonus balansi (`bonus_balance`) va umumiy xarajatlari (`total_spent`). Telegram bot bilan bog'lash uchun `telegram_chat_id` ham bor.
- **RestaurantTable (Stollar)**: Stollar holati `AVAILABLE`, `OCCUPIED`, `RESERVED`.
- **Order & OrderItem (Buyurtmalar)**:
  - Buyurtma manbalari: `DINE_IN`, `TAKEAWAY`, `DELIVERY`.
  - Buyurtma holatlari: `PENDING`, `ACCEPTED`, `PREPARING`, `READY`, `SERVED`, `COMPLETED`, `CANCELLED`.
  - Har bir buyurtma stoli (`table_id`), mijozi (`customer_id`), ofitsianti (`waiter_id`) bilan bog'lanishi mumkin.
- **Payment (To'lovlar)**: To'lov usullari: `CASH`, `CARD`, `TRANSFER`, `BONUS`.
- **Inventory & StockMovement (Omborxona)**: Ombor qoldiqlari va mahsulot harakati (`IN`, `OUT`, `ADJUSTMENT`, `WASTE`).
- **ShiftSession (Smenalar)**: Kassirlar uchun smena ochish va yopish. Kassa qoldiqlari hisoboti.
- **Expense (Xarajatlar)**: Filial xarajatlari hisobi.

## 3. Frontend va API Aloqasi (Communication)
- Frontend backend bilan **Axios** orqali bog'lanadi.
- API manzili asosiy sozlamada (ko'pincha `http://localhost:3000/api`) qilib belgilangan.
- **Avtorizatsiya**: Bearer Token asosida ishlaydi. Token `localStorage` da saqlanadi va Axios Interceptor orqali har bir so'rovning `Authorization` header'iga avtomatik qo'shib jo'natiladi.
- Frontend qismida jadvallar, grafiklar va hisobotlar chiqarish uchun ma'lumotlar tahlil qilinadi. Recharts kutubxonasi yordamida dashboard grafiklari chiziladi.

## 4. ChatGPT uchun yo'riqnoma (Prompt Context)
*Ushbu qismni ChatGPT'ga loyiha haqida savol berayotganda kontekst sifatida kiritishingiz mumkin:*

> "Mening loyiham React, Tailwind, Express va Prisma (PostgreSQL) da yozilgan Restoran boshqaruvi tizimi. Ma'lumotlar bazasida filiallar, foydalanuvchilar (rollarga ajratilgan), menyu, stollar, buyurtmalar, omborxona, kassa smenalari va xarajatlar modullari mavjud. API axios orqali token asosida ishlaydi. Men hozir ... [shu yerda nima muammo yoki qanday funksiya qo'shmoqchi ekanligingizni yozing] qilmoqchiman. Menga Prisma query yoki React komponentini yozib ber."

## Xulosa
Backend ma'lumotlar bazasi ancha mukammal tuzilgan va relatsion aloqalar orqali barcha jarayonlar bir-biriga bog'langan (Smena -> Buyurtma -> To'lov -> Omborxona). Frontend esa API dan kelayotgan JSON ma'lumotlarni qabul qilib olib, ularni ekranda chiroyli UI qilib ko'rsatib berish uchun xizmat qiladi.

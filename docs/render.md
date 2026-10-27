# ย้าย hosting ไป Vercel

โปรเจกต์เปลี่ยนจาก Render ไปใช้ Vercel แล้ว ดูการตั้งค่า Production, Preview และ Environment Variables ใน [คู่มือ Vercel](vercel.md)

ไฟล์ `render.yaml` และคำสั่ง `render:build` ถูกถอดออก การแก้โค้ดนี้ไม่ได้ปิด service เดิมบน Render ให้ทดสอบ Vercel และย้าย domain สำเร็จก่อนหยุด service เดิม

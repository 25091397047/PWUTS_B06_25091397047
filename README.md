# RuangKita — Kalender & Riwayat Booking

Proyek ini merupakan prototipe frontend untuk membantu melihat kalender pemakaian ruang, riwayat pengajuan, dan membuat simulasi jadwal booking berulang.
Tema visual menggunakan palet oranye hangat dengan aksen peach dan latar krem, tanpa mengubah isi maupun alur utama website.

## Bagian utama

- **Dashboard kalender (`index.html`)**: ringkasan pengajuan, kalender bulanan, agenda mendatang, serta detail booking saat tanggal kalender dipilih.
- **Riwayat booking (`pages/riwayat.html`)**: pencarian berdasarkan kode/ruang/tujuan/status, filter status dan tanggal, detail transaksi, pagination, reset filter, dan ekspor hasil filter ke CSV.
- **Booking berulang (`pages/berulang.html`)**: form jadwal mingguan dengan validasi input, perkiraan jumlah kemunculan, dan ringkasan tanggal jadwal.

## Teknologi

HTML, CSS, JavaScript, dan jQuery lokal. Tidak ada backend PHP atau koneksi database pada paket ini. Data booking merupakan data contoh yang ditulis di JavaScript; validasi form berjalan di browser dan belum menyimpan pengajuan ke server.

## Cara menjalankan di Laragon (Windows)

1. Ekstrak folder proyek ke direktori `C:\laragon\www\`.
2. Pastikan struktur foldernya seperti berikut:

   ```text
   C:\laragon\www\PWUTS_K6_25091397047\
   ├── index.html
   ├── assets\
   │   ├── app.js
   │   ├── pages-data.js
   │   ├── jquery.min.js
   │   └── style.css
   └── pages\
       ├── riwayat.html
       └── berulang.html
   ```

3. **Cara yang disarankan:** buka Laragon, klik **Start All**, lalu akses `http://localhost/PWUTS_K6_25091397047/`.
4. **Cara cepat tanpa Laragon:** klik dua kali `index.html`. Versi ini telah dibundel dengan konten halaman Riwayat dan Booking Berulang sehingga navigasi utama tetap berfungsi saat dibuka melalui `file:///...`.
5. Koneksi internet hanya dibutuhkan bila ingin memuat font dari Google; jQuery dan konten halaman inti sudah disertakan secara lokal.

## Fitur tambahan pada versi desain ulang

- Kalender dapat dipilih per tanggal dan menampilkan booking yang jatuh pada tanggal tersebut.
- Daftar agenda mendatang diurutkan berdasarkan tanggal dan jam.
- Riwayat dapat diekspor ke CSV berdasarkan filter yang sedang aktif.
- Ringkasan booking berulang menampilkan kode simulasi dan daftar tanggal yang cocok.
- Tata letak responsif untuk desktop dan layar ponsel.
- Menu Riwayat dan Booking Berulang dapat dibuka baik dari `file://` maupun server lokal.

## Catatan penting

Tampilan dan interaksi di atas adalah prototipe frontend untuk kebutuhan UTS. Ekspor CSV menggunakan data contoh. Pengajuan booking belum benar-benar dikirim, belum ada autentikasi pengguna, dan belum ada penyimpanan permanen. Jika tugas mengharuskan backend, proyek ini perlu dilanjutkan dengan PHP dan database seperti MySQL.

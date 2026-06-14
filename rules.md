# Rules untuk Animasi (Anime.js v4 & Spline 3D)

## Spline 3D
1. Gunakan \`@splinetool/react-spline\` untuk memuat animasi 3D.
2. Buat objek Spline dengan state animasi idle yang berlangsung terus-menerus (continuous/loop) sehingga terasa hidup.
3. Gunakan material glassmorphism dan obsidian/gold pada Spline untuk cocok dengan tema Emerald Kingdom.

## Anime.js v4
1. Gunakan Anime.js untuk transisi masuk (entrance) pada elemen-elemen DOM (seperti panel lelang, teks judul, notifikasi).
2. Terapkan efek stagger untuk memunculkan item lelang satu per satu.
3. Buat animasi idle (seperti efek *floating* atau *pulsing*) menggunakan Anime.js dengan property \`loop: true\` dan \`direction: 'alternate'\`.

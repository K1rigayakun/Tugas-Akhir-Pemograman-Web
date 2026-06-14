import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@emerald-kingdom/db";

export async function POST(req: Request) {
  try {
    const { cosmeticId } = await req.json();

    if (!cosmeticId) {
      return NextResponse.json({ message: "Cosmetic ID wajib diberikan" }, { status: 400 });
    }

    // 1. Verifikasi kosmetik ada di database
    const cosmetic = await prisma.cosmetic.findUnique({
      where: { id: cosmeticId }
    });

    if (!cosmetic) {
      return NextResponse.json({ message: "Kosmetik tidak ditemukan" }, { status: 404 });
    }

    if (cosmetic.type !== "WEB_CODE") {
      return NextResponse.json({ message: "Kosmetik bukan tipe Web Code" }, { status: 400 });
    }

    // [TUTORIAL/PLACEHOLDER]: Di aplikasi aslinya, di sini kita cek apakah user benar-benar
    // memiliki kosmetik ini (cek tabel UserCosmetic)
    // const userCosmetic = await prisma.userCosmetic.findUnique({ where: { ... } })

    // 2. Set Cookie (httpOnly) agar aman dari XSS
    cookies().set({
      name: "equipped_web_code_id",
      value: cosmeticId,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 hari
    });

    return NextResponse.json({ message: "Kosmetik berhasil dipasang", cosmetic });
  } catch (error: any) {
    console.error("Error Equip Cosmetic:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  cookies().delete("equipped_web_code_id");
  return NextResponse.json({ message: "Kosmetik berhasil dilepas" });
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI | null = null;
  
  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log("Gemini AI initialized.");
    } else {
      this.logger.warn("GEMINI_API_KEY not found. AI features will use mock responses.");
    }
  }

  /**
   * AI Museum Curator (RINA)
   * Generates a lore/story about an item in the museum.
   */
  async generateMuseumStory(auctionId: string): Promise<string> {
    try {
      const auction = await this.prisma.auction.findUnique({
        where: { id: auctionId }
      });

      if (!auction) {
        throw new Error("Relik tidak ditemukan di museum.");
      }

      const prompt = `Bertindaklah sebagai RINA (Royal Intelligence Network Assistant), AI berkelas, elegan, dan sedikit angkuh namun melayani kaisar. Berikan respon maksimal 3 paragraf pendek. Ceritakan sejarah fiktif namun epik tentang relik bernama "${auction.title}" (${auction.rarity}) yang dihargai sebesar ${auction.currentPrice} CC.`;
      
      this.logger.log(`Sending prompt to Gemini: ${prompt}`);

      if (this.genAI) {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text();
      }
      
      // MOCK RESPONSE FALLBACK
      return `*Tersenyum elegan* "Ah, ${auction.title}... Sebuah relik berkelas ${auction.rarity} yang memiliki sejarah panjang di kekaisaran Aurum. Konon kabarnya, benda ini tidak hanya memancarkan aura kemewahan senilai ${auction.currentPrice.toLocaleString('id-ID')} Crown Coins, namun juga menyimpan kutukan ringan bagi mereka yang tak pantas menyimpannya. Apakah Anda merasa pantas memilikinya, Tuanku?"`;

    } catch (error: any) {
      this.logger.error("Failed to generate museum story", error);
      return "Maaf Tuanku, arsip museum sedang terganggu. RINA tidak dapat menceritakan sejarah relik ini untuk saat ini.";
    }
  }

  /**
   * AI Fraud Detection
   * Menganalisis tawaran yang masuk untuk mendeteksi anomali.
   */
  async detectFraud(amount: number, userRank: string, currentPrice: number): Promise<{ isFraud: boolean; reason?: string }> {
    // 1. Rule-based Fraud Check
    if (amount >= currentPrice * 10 && !["EMPEROR", "KING"].includes(userRank)) {
      this.logger.warn(`[AI Fraud Rule] Anomali terdeteksi: Bid terlalu besar (${amount}) dari rank ${userRank}`);
      return { 
        isFraud: true, 
        reason: "RINA mendeteksi anomali pada penawaran Anda. Peningkatan harga terlalu ekstrem untuk profil kelas Anda." 
      };
    }

    // 2. Gemini Analysis (Opsional untuk kasus rumit, tapi demi speed kita return false)
    // Di masa depan bisa kita lempar data history user ke Gemini.
    return { isFraud: false };
  }
}

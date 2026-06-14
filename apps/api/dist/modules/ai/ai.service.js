"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const generative_ai_1 = require("@google/generative-ai");
let AiService = AiService_1 = class AiService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AiService_1.name);
        this.genAI = null;
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.logger.log("Gemini AI initialized.");
        }
        else {
            this.logger.warn("GEMINI_API_KEY not found. AI features will use mock responses.");
        }
    }
    /**
     * AI Museum Curator (RINA)
     * Generates a lore/story about an item in the museum.
     */
    async generateMuseumStory(auctionId) {
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
        }
        catch (error) {
            this.logger.error("Failed to generate museum story", error);
            return "Maaf Tuanku, arsip museum sedang terganggu. RINA tidak dapat menceritakan sejarah relik ini untuk saat ini.";
        }
    }
    /**
     * AI Fraud Detection
     * Menganalisis tawaran yang masuk untuk mendeteksi anomali.
     */
    async detectFraud(amount, userRank, currentPrice) {
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
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map
import { validate } from "class-validator";
import { CreateAuctionDto } from "./create-auction.dto";
import { AuctionType, ItemRarity, Rank } from "@prisma/client";

describe("CreateAuctionDto", () => {
  describe("Valid DTO", () => {
    it("should pass validation with all required fields", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Test Auction Item";
      dto.description = "This is a test auction description with at least 20 characters";
      dto.category = "Weapons";
      dto.rarity = ItemRarity.LEGENDARY;
      dto.auctionType = AuctionType.STANDARD;
      dto.startingPrice = 10000;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should pass validation with optional fields", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Rare Emerald Sword";
      dto.description = "A legendary weapon found in the depths of the Emerald Kingdom";
      dto.category = "Weapons";
      dto.rarity = ItemRarity.LEGENDARY;
      dto.auctionType = AuctionType.RANK_EXCL;
      dto.startingPrice = 5000;
      dto.minimumIncrement = 100;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";
      dto.minimumRank = Rank.KNIGHT;
      dto.imageUrls = ["https://example.com/image1.jpg"];

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe("Invalid DTO - Required Fields", () => {
    it("should fail validation when title is missing", async () => {
      const dto = new CreateAuctionDto();
      dto.description = "This is a test auction description with at least 20 characters";
      dto.category = "Weapons";
      dto.auctionType = AuctionType.STANDARD;
      dto.startingPrice = 10000;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === "title")).toBe(true);
    });

    it("should fail validation when title is too short", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Test";
      dto.description = "This is a test auction description with at least 20 characters";
      dto.category = "Weapons";
      dto.auctionType = AuctionType.STANDARD;
      dto.startingPrice = 10000;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === "title")).toBe(true);
    });

    it("should fail validation when description is too short", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Test Auction";
      dto.description = "Too short";
      dto.category = "Weapons";
      dto.auctionType = AuctionType.STANDARD;
      dto.startingPrice = 10000;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === "description")).toBe(true);
    });

    it("should fail validation when startingPrice is less than 1", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Test Auction Item";
      dto.description = "This is a test auction description with at least 20 characters";
      dto.category = "Weapons";
      dto.auctionType = AuctionType.STANDARD;
      dto.startingPrice = 0;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === "startingPrice")).toBe(true);
    });
  });

  describe("Invalid DTO - Date Range Validation", () => {
    it("should fail validation when endTime is before startTime", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Test Auction Item";
      dto.description = "This is a test auction description with at least 20 characters";
      dto.category = "Weapons";
      dto.auctionType = AuctionType.STANDARD;
      dto.startingPrice = 10000;
      dto.startTime = "2024-01-20T10:00:00Z";
      dto.endTime = "2024-01-15T10:00:00Z"; // Before startTime

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === "endTime")).toBe(true);
    });

    it("should fail validation when endTime equals startTime", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Test Auction Item";
      dto.description = "This is a test auction description with at least 20 characters";
      dto.category = "Weapons";
      dto.auctionType = AuctionType.STANDARD;
      dto.startingPrice = 10000;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-15T10:00:00Z"; // Same as startTime

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === "endTime")).toBe(true);
    });
  });

  describe("Invalid DTO - Enum Validation", () => {
    it("should fail validation with invalid auctionType", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Test Auction Item";
      dto.description = "This is a test auction description with at least 20 characters";
      dto.category = "Weapons";
      dto.auctionType = "INVALID_TYPE" as AuctionType;
      dto.startingPrice = 10000;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === "auctionType")).toBe(true);
    });

    it("should fail validation with invalid rarity", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Test Auction Item";
      dto.description = "This is a test auction description with at least 20 characters";
      dto.category = "Weapons";
      dto.rarity = "INVALID_RARITY" as ItemRarity;
      dto.auctionType = AuctionType.STANDARD;
      dto.startingPrice = 10000;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === "rarity")).toBe(true);
    });
  });

  describe("Optional Fields Based on AuctionType", () => {
    it("should pass validation for DESCENDING type with minimumPrice and decrementAmount", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Dutch Auction Item";
      dto.description = "This is a descending auction where price decreases over time";
      dto.category = "Collectibles";
      dto.auctionType = AuctionType.DESCENDING;
      dto.startingPrice = 10000;
      dto.minimumPrice = 5000;
      dto.decrementAmount = 100;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should pass validation for RANK_EXCL type with minimumRank", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Exclusive Knight Armor";
      dto.description = "Only available for Knights and above - exclusive auction";
      dto.category = "Armor";
      dto.auctionType = AuctionType.RANK_EXCL;
      dto.startingPrice = 15000;
      dto.minimumRank = Rank.KNIGHT;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should pass validation for SEALED_CHEST type with isSealed", async () => {
      const dto = new CreateAuctionDto();
      dto.title = "Mystery Box Auction";
      dto.description = "A sealed chest containing mysterious rewards for the winner";
      dto.category = "Mystery";
      dto.auctionType = AuctionType.SEALED_CHEST;
      dto.startingPrice = 5000;
      dto.isSealed = true;
      dto.startTime = "2024-01-15T10:00:00Z";
      dto.endTime = "2024-01-20T10:00:00Z";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

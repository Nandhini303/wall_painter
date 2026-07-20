"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Color_1 = __importDefault(require("../models/Color"));
const Texture_1 = __importDefault(require("../models/Texture"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || '';
const trendingColors = [
    {
        brandName: 'LuminaPaint Swatch',
        colorCode: 'LP-001',
        name: 'Soft Sage',
        hexCode: '#a3b18a',
        r: 163,
        g: 177,
        b: 138,
        isActive: true
    },
    {
        brandName: 'LuminaPaint Swatch',
        colorCode: 'LP-002',
        name: 'Warm Terracotta',
        hexCode: '#7f301b',
        r: 127,
        g: 48,
        b: 27,
        isActive: true
    },
    {
        brandName: 'LuminaPaint Swatch',
        colorCode: 'LP-003',
        name: 'Obsidian Blue',
        hexCode: '#0f172a',
        r: 15,
        g: 23,
        b: 42,
        isActive: true
    },
    {
        brandName: 'LuminaPaint Swatch',
        colorCode: 'LP-004',
        name: 'Ethereal Gray',
        hexCode: '#e4e2dd',
        r: 228,
        g: 226,
        b: 221,
        isActive: true
    },
    {
        brandName: 'Architectural Pro',
        colorCode: 'AP-501',
        name: 'Raw Concrete',
        hexCode: '#8d99ae',
        r: 141,
        g: 153,
        b: 174,
        isActive: true
    },
    {
        brandName: 'Architectural Pro',
        colorCode: 'AP-502',
        name: 'Crimson Glow',
        hexCode: '#d90429',
        r: 217,
        g: 4,
        b: 41,
        isActive: true
    }
];
const standardTextures = [
    {
        name: 'Matte Plaster',
        imageUri: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=400&q=50',
        scaleDefault: 1.0
    },
    {
        name: 'Brushed Velvet',
        imageUri: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=50',
        scaleDefault: 1.5
    },
    {
        name: 'Textured Stucco',
        imageUri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=50',
        scaleDefault: 0.8
    }
];
const seed = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined.');
        }
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Seeder: Database connected.');
        // Clear and seed colors
        await Color_1.default.deleteMany({});
        await Color_1.default.insertMany(trendingColors);
        console.log('Seeder: Paint Color catalog seeded successfully.');
        // Clear and seed textures
        await Texture_1.default.deleteMany({});
        await Texture_1.default.insertMany(standardTextures);
        console.log('Seeder: Texture library seeded successfully.');
        await mongoose_1.default.connection.close();
        console.log('Seeder: Process completed and DB connection closed.');
    }
    catch (error) {
        console.error('Seeder failed:', error);
        process.exit(1);
    }
};
seed();

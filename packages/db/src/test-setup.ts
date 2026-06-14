// Test setup file - loads environment variables from .env file
import { config } from 'dotenv';
import path from 'path';

// Load .env from project root
config({ path: path.resolve(__dirname, '../../../.env') });

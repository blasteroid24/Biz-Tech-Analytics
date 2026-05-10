import { db } from '../config/db.js';
import { admins } from '../models/admin-schema.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedAdmin() {
    try {
        const username = process.env.ADMIN_USERNAME!;
        const password = process.env.ADMIN_PASSWORD!;

        const existingAdmin = await db.query.admins.findFirst();

        if (existingAdmin) {
            console.log('Admin already exists. Skipping initialization.');
            process.exit(0);
        }

        console.log(`No admin found. Creating root admin: ${username}...`);

        const passwordHash = await bcrypt.hash(password, 12);

        await db.insert(admins).values({
            username,
            passwordHash
        });

        console.log('Root admin created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to initialize admin:', error);
        process.exit(1);
    }
}

seedAdmin();

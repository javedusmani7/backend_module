import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.IV, 'hex');

// Encrypt Function
export const encryptResponse = (text) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

// Middleware to encrypt the response
const responseEncrypt = (req, res, next) => {
    const originalJson = res.json;
    res.json = (data) => {
        try {
            const encryptedData = encryptResponse(JSON.stringify(data));
            originalJson.call(res, { data: encryptedData });
        } catch (error) {
            console.error("Encryption error:", error.message);
            originalJson.call(res, { error: "Failed to encrypt response" });
        }
    };

    next();
};

export default responseEncrypt;
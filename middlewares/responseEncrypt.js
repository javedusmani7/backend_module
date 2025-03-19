import crypto from 'crypto';
const encryptionKey = crypto.randomBytes(32); 
const iv = crypto.randomBytes(16); 

// Encrypt Function
const encryptResponse = (text) => {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`; 
};

// encrypted response
const responseEncrypt = (req, res, next) => {
    const originalJson = res.json;

    res.json = (data) => {
        const encryptedData = encryptResponse(JSON.stringify(data));
        originalJson.call(res, { data: encryptedData }); 
    };

    next();
};

export default responseEncrypt;
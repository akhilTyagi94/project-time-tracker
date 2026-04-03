const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const clientPath = path.join(__dirname, '..', 'prisma', 'client');

/**
 * Hybrid Prisma Setup Script (v2 - Efficient)
 * Detects if we are on Vercel vs Local development and toggles the provider.
 * Now only generates if the provider changed or client is missing,
 * preventing HMR infinite loops in Next.js development.
 */
try {
    let schema = fs.readFileSync(schemaPath, 'utf8');

    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    const targetProvider = isProduction ? 'postgresql' : 'sqlite';

    console.log(`\n\x1b[36m[Prisma Setup]\x1b[0m Target Environment: ${isProduction ? 'Production' : 'Local'}`);

    // Replace provider = "..." with the correct target
    const newSchema = schema.replace(
        /provider\s*=\s*"(postgresql|sqlite)"/,
        `provider = "${targetProvider}"`
    );

    const providerChanged = schema !== newSchema;
    const clientMissing = !fs.existsSync(clientPath);

    if (providerChanged) {
        fs.writeFileSync(schemaPath, newSchema);
        console.log(`\x1b[32m[Prisma Setup]\x1b[0m schema.prisma updated to: \x1b[33m${targetProvider}\x1b[0m`);
    } else {
        console.log(`\x1b[34m[Prisma Setup]\x1b[0m Provider is already correct (\x1b[33m${targetProvider}\x1b[0m).`);
    }

    // Only run generate if the provider changed OR the client is folder is missing
    if (providerChanged || clientMissing) {
        console.log(`\x1b[36m[Prisma Setup]\x1b[0m ${clientMissing ? 'Client missing' : 'Provider changed'}. Generating Prisma Client...\n`);
        execSync('npx prisma generate', { stdio: 'inherit' });
    } else {
        console.log(`\x1b[32m[Prisma Setup]\x1b[0m Client already exists. Skipping generation to save time and avoid HMR loops.\n`);
    }

} catch (error) {
    console.error(`\x1b[31m[Prisma Setup Error]\x1b[0m ${error.message}`);
    process.exit(1);
}

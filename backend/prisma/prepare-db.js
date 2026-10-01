const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
  console.log('🔄 Detected PostgreSQL DATABASE_URL. Configuring Prisma for postgresql...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|mysql|postgresql)"/, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema);
} else if (dbUrl.startsWith('mysql://')) {
  console.log('🔄 Detected MySQL DATABASE_URL. Configuring Prisma for mysql...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|mysql|postgresql)"/, 'provider = "mysql"');
  fs.writeFileSync(schemaPath, schema);
} else {
  console.log('ℹ️ Local or file-based database detected. Keeping SQLite provider.');
}

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing records in proper relational order
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@12345', salt);
  const ownerPassword = await bcrypt.hash('Owner@12345', salt);
  const userPassword = await bcrypt.hash('User@12345', salt);

  // 1. Create System Administrator
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Primary Account',
      email: 'admin@storerating.com',
      password: adminPassword,
      address: 'Suite 900, 500 Enterprise Way, Technology Park, CA 94016',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 2. Create Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Johnathan Alexander Vance Esq',
      email: 'john.vance@storeowner.com',
      password: ownerPassword,
      address: '42 Baker Street, West End Quarter, London WC1N 3AX',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Eleanor Beatrice Sterling',
      email: 'eleanor.sterling@storeowner.com',
      password: ownerPassword,
      address: '742 Evergreen Terrace, North Commercial Block, Springfield, OR 97477',
      role: 'STORE_OWNER',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Marcus Aurelius Davenport',
      email: 'marcus.davenport@storeowner.com',
      password: ownerPassword,
      address: '15 Ocean Boulevard, Harbor Point District, Miami, FL 33139',
      role: 'STORE_OWNER',
    },
  });
  console.log('✅ Store Owners created');

  // 3. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Downtown Premium Artisan Bakery & Cafe',
      email: 'downtown.bakery@stores.com',
      address: '124 Market Square, Central Arts District, Austin, TX 78701',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Apex Electronics Superstore Central',
      email: 'apex.electronics@stores.com',
      address: '880 Silicon Avenue, Innovation Center, San Jose, CA 95113',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Heritage Books & Literary Corner',
      email: 'heritage.books@stores.com',
      address: '305 Harvard Yard Way, University Row, Cambridge, MA 02138',
      ownerId: owner3.id,
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: 'Greenfield Organic Harvest Grocers',
      email: 'greenfield.grocers@stores.com',
      address: '500 Meadow Lane, Sustainable Parkview, Portland, OR 97201',
      ownerId: null,
    },
  });
  console.log('✅ Stores created');

  // 4. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Benjamin Christopher Hayes',
      email: 'benjamin.hayes@example.com',
      password: userPassword,
      address: '12 Maplewood Crescent, Suburban Heights, Denver, CO 80202',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Samantha Elizabeth Miller',
      email: 'samantha.miller@example.com',
      password: userPassword,
      address: '89 Willow Brook Avenue, Riverside Gardens, Chicago, IL 60601',
      role: 'USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Alexander Nathaniel Wright',
      email: 'alexander.wright@example.com',
      password: userPassword,
      address: '430 Pinecrest Ridge Road, Hilltop Valley, Seattle, WA 98101',
      role: 'USER',
    },
  });
  console.log('✅ Normal Users created');

  // 5. Create Initial Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user3.id, storeId: store1.id, rating: 5 },

      { userId: user1.id, storeId: store2.id, rating: 4 },
      { userId: user2.id, storeId: store2.id, rating: 3 },

      { userId: user2.id, storeId: store3.id, rating: 5 },
      { userId: user3.id, storeId: store3.id, rating: 5 },

      { userId: user1.id, storeId: store4.id, rating: 4 },
    ],
  });
  console.log('✅ Ratings created');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

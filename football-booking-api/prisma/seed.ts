import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('123456', 10);

    await prisma.user.upsert({
        where: { phone: '0909999999' },
        update: {},
        create: { phone: '0909999999', password, role: 'ADMIN' },
    });

    await prisma.user.upsert({
        where: { phone: '0908888888' },
        update: {},
        create: { phone: '0908888888', password, role: 'OWNER' },
    });

    await prisma.user.upsert({
        where: { phone: '0907777777' },
        update: {},
        create: { phone: '0907777777', password, role: 'USER' },
    });

    console.log('Seeded ADMIN / OWNER / USER');
}

main();

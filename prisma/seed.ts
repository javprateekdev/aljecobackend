import { Command } from 'commander';
import { PrismaClient } from '@prisma/client';
import { isEmail } from 'class-validator';
import { admin } from './seeds';

const program = new Command();
program.option('--seed-only <name>', 'Specify a seed name').parse(process.argv);

const prisma = new PrismaClient();

async function main() {
  const options = program.opts();

  // Seed admin default credential
  if (!options.seedOnly || options.seedOnly === 'admin') {
    if (await prisma.admin.count()) {
      console.log('⚠ Skipping seed for `admin`, due to non-empty table');
    } else {
      if (
        isEmail(admin.email) &&
        admin.meta?.create?.passwordHash &&
        admin.meta.create.passwordSalt
      ) {
        await prisma.admin.create({
          data: admin,
        });
      } else {
        console.error(new Error('Invalid default admin credentials found'));
      }
    }
  }
  const colours = await prisma.colour.createMany({
    data: [
      { colourName: 'Red' },
      { colourName: 'Blue' },
      { colourName: 'Green' },
    ],
  });

  // Seed Style
  const styles = await prisma.style.createMany({
    data: [
      { name: 'Casual' },
      { name: 'Formal' },
      { name: 'Sporty' },
    ],
  });

  // Seed NeckLine
  const necklines = await prisma.neckLine.createMany({
    data: [
      { name: 'V-Neck' },
      { name: 'Round-Neck' },
      { name: 'Collared' },
    ],
  });

  // Seed SleeveLength
  const sleeveLengths = await prisma.sleeveLength.createMany({
    data: [
      { name: 'Short Sleeve' },
      { name: 'Long Sleeve' },
      { name: 'Sleeveless' },
    ],
  });

  // Seed Season
  const seasons = await prisma.season.createMany({
    data: [
      { name: 'Summer' },
      { name: 'Winter' },
      { name: 'Spring' },
    ],
  });

  // Seed Length
  const lengths = await prisma.length.createMany({
    data: [
      { name: 'Short' },
      { name: 'Knee-length' },
      { name: 'Long' },
    ],
  });

  // Seed BodyFit
  const bodyFits = await prisma.bodyFit.createMany({
    data: [
      { name: 'Slim Fit' },
      { name: 'Regular Fit' },
      { name: 'Loose Fit' },
    ],
  });

  // Seed DressType
  const dressTypes = await prisma.dressType.createMany({
    data: [
      { name: 'Evening Dress' },
      { name: 'Casual Dress' },
      { name: 'Party Dress' },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// prisma/seed.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Seed default models
    const models = [
      {
        name: "gpt-4o-mini",
        provider: "openai",
        tags: ["Free"],
        pricePerMillionTokens: 0.6,
        initialTokens: 200000,
        resetTokens: 50000,
      },
      {
        name: "gpt-4o",
        provider: "openai",
        tags: ["Premium"],
        pricePerMillionTokens: 7,
        initialTokens: 50000,
        resetTokens: 25000,
      },
      {
        name: "claude-3-5-sonnet-20240620",
        provider: "anthropic",
        tags: ["Premium"],
        pricePerMillionTokens: 5,
        initialTokens: 50000,
        resetTokens: 25000,
      },
    ];

    for (const model of models) {
      await prisma.model.upsert({
        where: { name: model.name },
        update: {
          provider: model.provider,
          pricePerMillionTokens: model.pricePerMillionTokens,
          initialTokens: model.initialTokens,
          resetTokens: model.resetTokens,
        },
        create: {
          name: model.name,
          provider: model.provider,
          tags: model.tags,
          pricePerMillionTokens: model.pricePerMillionTokens,
          initialTokens: model.initialTokens,
          resetTokens: model.resetTokens,
        },
      });
    }

    console.log("Default models have been seeded");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

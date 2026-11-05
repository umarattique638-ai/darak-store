/**
 * npm run seed
 * Creates/updates the admin (SEED_ADMIN_EMAIL/PASSWORD) and, when the store is empty,
 * loads the sample categories and products. Safe to run more than once.
 */
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { Category, Product, StockMovement, User } from "../models/index.js";
import { starterCategories, starterProducts } from "../data/starter.js";
import { slugify } from "../utils/slugify.js";

async function run() {
  await connectDB();
  const email = env.SEED_ADMIN_EMAIL.trim().toLowerCase();
  if (email && env.SEED_ADMIN_PASSWORD) {
    const res = await User.updateOne(
      { email },
      { $set: { password: await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12), role: "admin", emailVerified: true, blocked: false }, $setOnInsert: { name: "Store Admin", email } },
      { upsert: true },
    );
    console.info(`👤 Admin ${res.upsertedCount ? "created" : "updated"}: ${email}`);
  } else console.info("ℹ️  Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env to create the admin");

  if (env.SEED_SAMPLE_DATA && (await Product.estimatedDocumentCount()) === 0) {
    const cats = new Map<string, unknown>();
    for (const c of starterCategories) {
      const doc = await Category.findOneAndUpdate({ slug: c.slug }, { $setOnInsert: c }, { upsert: true, returnDocument: "after" });
      cats.set(c.slug, doc!._id);
    }
    for (const p of starterProducts) {
      const doc = await Product.create({
        name: { en: p.en, ar: p.ar }, slug: slugify(p.en), sku: p.sku, description: { en: p.den, ar: p.dar }, category: cats.get(p.cat) as never,
        price: p.price, compareAtPrice: p.compare ?? null,
        images: p.img.map((url) => ({ url, alt: p.en })),
        materials: p.materials as never, colors: p.colors.map(([name, hex]) => ({ name, hex })),
        dimensions: { width: p.dim[0], depth: p.dim[1], height: p.dim[2] }, stock: p.stock, featured: !!p.featured,
      });
      if (p.stock) await StockMovement.create({ product: doc._id, change: p.stock, stockAfter: p.stock, reason: "restock", note: "Opening stock" });
    }
    console.info(`🌱 Seeded ${starterCategories.length} categories and ${starterProducts.length} products`);
  } else console.info("ℹ️  Products already exist — sample data skipped");

  // Older seeds used stock photos: swap them for the rendered images (only untouched sample items).
  let swapped = 0;
  for (const p of starterProducts) {
    const r = await Product.updateOne({ sku: p.sku, "images.url": /images\.unsplash\.com/ }, { $set: { images: p.img.map((url) => ({ url, alt: p.en })) } });
    swapped += r.modifiedCount;
  }
  for (const c of starterCategories) {
    const r = await Category.updateOne({ slug: c.slug, image: /images\.unsplash\.com/ }, { $set: { image: c.image } });
    swapped += r.modifiedCount;
  }
  if (swapped) console.info(`🖼️  Updated images on ${swapped} sample items`);
  await disconnectDB();
}

run().catch(async (e) => {
  console.error(e);
  await disconnectDB();
  process.exit(1);
});

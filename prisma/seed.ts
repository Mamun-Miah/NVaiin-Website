import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("nvaiin2023!", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@nvaiin.com" },
    update: {},
    create: {
      email: "admin@nvaiin.com",
      password: hashedPassword,
      name: "N'VAIIN Admin",
    },
  });

  // Create products
  const whiteTee = await prisma.product.upsert({
    where: { slug: "happy-nvaiin-oversized-drop-shoulder-cropped-white-t-shirt" },
    update: {},
    create: {
      name: "Happy N'VAIIN Oversized Drop Shoulder Cropped White T-Shirt",
      slug: "happy-nvaiin-oversized-drop-shoulder-cropped-white-t-shirt",
      description:
        "Limited edition oversized drop shoulder cropped tee. Premium heavyweight cotton, relaxed fit with dropped shoulders. The signature Happy N'VAIIN graphic is screen-printed with discharge ink for a vintage feel. Each piece is numbered as part of our first conscious drop.",
      price: 65.0,
      compareAtPrice: 85.0,
      images: JSON.stringify([
        "https://www.nvaiin.com/cdn/shop/files/PhotoRoom_20231204_005221.jpg?v=1701670313",
      ]),
      sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
      category: "t-shirts",
      tags: JSON.stringify(["limited", "featured", "new-drop", "cotton"]),
      isLimited: true,
      isFeatured: true,
      inStock: true,
      stockQty: 50,
      displayOrder: 1,
    },
  });

  const blackTee = await prisma.product.upsert({
    where: { slug: "happy-nvaiin-oversized-cropped-black-t-shirt" },
    update: {},
    create: {
      name: "Happy N'VAIIN Oversized Cropped Black T-Shirt",
      slug: "happy-nvaiin-oversized-cropped-black-t-shirt",
      description:
        "Limited edition oversized cropped tee in jet black. Premium heavyweight cotton with a boxy silhouette. Features our iconic Happy N'VAIIN graphic in monochrome. Made to last, made with purpose. Not made in vain.",
      price: 65.0,
      compareAtPrice: 85.0,
      images: JSON.stringify([
        "https://www.nvaiin.com/cdn/shop/files/PhotoRoom_20231203_141648.jpg?v=1701631462",
      ]),
      sizes: JSON.stringify(["XS", "S", "M", "L", "XL"]),
      category: "t-shirts",
      tags: JSON.stringify(["limited", "featured", "new-drop", "black"]),
      isLimited: true,
      isFeatured: true,
      inStock: true,
      stockQty: 50,
      displayOrder: 2,
    },
  });

  // Create default site settings
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      storeName: "N'VAIIN",
      tagline: "Not Made In Vain",
      contactEmail: "contact@nvaiin.com",
      announcementActive: true,
      announcementText: "FREE SHIPPING ON ORDERS OVER $75 ✦ NEW DROP LIVE NOW ✦",
      heroTagline: "NOT MADE IN VAIN",
      heroSubheading: "Conscious Fashion. Timeless Style.",
      manifestoText:
        "NOT MADE IN VAIN ✦ CONSCIOUS FASHION ✦ 02.22.23 ✦ WEAR WITH PURPOSE ✦",
      pullQuote: "Style is a reflection of values.",
      metaTitle: "N'VAIIN — Not Made In Vain",
    },
  });

  // Create sample FAQs
  const faqs = [
    {
      question: "When do new drops release?",
      answer:
        "New drops release periodically throughout the year. Follow us on Instagram @nvaiin and sign up for our newsletter to be the first to know about upcoming releases.",
      category: "Orders",
      displayOrder: 1,
    },
    {
      question: "What is your return policy?",
      answer:
        "We accept returns within 14 days of delivery for unworn, unwashed items with original tags attached. Limited edition items are final sale. Contact us at contact@nvaiin.com to initiate a return.",
      category: "Returns",
      displayOrder: 2,
    },
    {
      question: "How do I find my size?",
      answer:
        "All our pieces are oversized. We recommend going with your normal size for the intended relaxed fit, or sizing down for a more fitted look. Check each product page for detailed measurements.",
      category: "Sizing",
      displayOrder: 3,
    },
    {
      question: "What does N'VAIIN mean?",
      answer:
        "N'VAIIN stands for 'Not Made In Vain.' It represents our belief that every garment should carry meaning and purpose. Born on 02/22/2023 at 2:22PM, the brand challenges mindless consumption and champions conscious fashion.",
      category: "Brand",
      displayOrder: 4,
    },
    {
      question: "Is this brand sustainable?",
      answer:
        "Sustainability is at the core of everything we do. We use premium, long-lasting materials, produce in limited quantities to reduce waste, and challenge disposable fashion culture. Our goal is to create pieces that stand the test of time.",
      category: "Brand",
      displayOrder: 5,
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Yes, we ship worldwide. Domestic orders over $75 qualify for free shipping. International shipping rates are calculated at checkout. Typical delivery is 5-7 business days domestically, 10-15 internationally.",
      category: "Shipping",
      displayOrder: 6,
    },
  ];

  for (const faq of faqs) {
    await prisma.faq.upsert({
      where: { id: `faq-${faq.displayOrder}` },
      update: {},
      create: { id: `faq-${faq.displayOrder}`, ...faq },
    });
  }

  // Create sample lookbook images
  const lookbookImages = [
    {
      id: "lookbook-1",
      imageUrl: "https://www.nvaiin.com/cdn/shop/files/PhotoRoom_20231204_005221.jpg?v=1701670313",
      title: "The White Drop",
      seasonLabel: "SEASON 01",
      displayOrder: 1,
    },
    {
      id: "lookbook-2",
      imageUrl: "https://www.nvaiin.com/cdn/shop/files/PhotoRoom_20231203_141648.jpg?v=1701631462",
      title: "Black Essence",
      seasonLabel: "SEASON 01",
      displayOrder: 2,
    },
    {
      id: "lookbook-3",
      imageUrl: "https://www.nvaiin.com/cdn/shop/files/PhotoRoom_20231204_005221.jpg?v=1701670313",
      title: "Raw Form",
      seasonLabel: "SEASON 01",
      displayOrder: 3,
    },
    {
      id: "lookbook-4",
      imageUrl: "https://www.nvaiin.com/cdn/shop/files/PhotoRoom_20231203_141648.jpg?v=1701631462",
      title: "Street Code",
      seasonLabel: "SEASON 01",
      displayOrder: 4,
    },
    {
      id: "lookbook-5",
      imageUrl: "https://www.nvaiin.com/cdn/shop/files/PhotoRoom_20231204_005221.jpg?v=1701670313",
      title: "Conscious Movement",
      seasonLabel: "SEASON 01",
      displayOrder: 5,
    },
  ];

  for (const img of lookbookImages) {
    await prisma.lookbookImage.upsert({
      where: { id: img.id },
      update: {},
      create: img,
    });
  }

  console.log("✅ Seed completed successfully");
  console.log(`   - 2 products created`);
  console.log(`   - 1 admin user created (admin@nvaiin.com / nvaiin2023!)`);
  console.log(`   - 6 FAQs created`);
  console.log(`   - 5 lookbook images created`);
  console.log(`   - Site settings initialized`);
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

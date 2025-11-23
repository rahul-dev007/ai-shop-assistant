import { NextRequest, NextResponse } from "next/server";
import Product from "@/lib/models/Product";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const products = [
      {
        name_bn: "রেড রোজ থ্রিপিস",
        name_en: "Red Rose Three-piece",
        category: "three-piece",
        price: 2200,
        tags: ["three piece", "থ্রিপিস", "3pis", "shalwar kameez", "red"],
        imageUrl:
          "https://i.ibb.co/7yxJxLb/red-threepiece.jpg",
        description_bn: "গর্জিয়াস লাল কালারের থ্রিপিস, পার্টি/ফাংশন উপযোগী।",
        colors: ["লাল"],
        sizes: ["M", "L", "XL"],
        stock: 10,
      },
      {
        name_bn: "ব্লু এমব্রয়ডারি থ্রিপিস",
        name_en: "Blue Embroidered Three-piece",
        category: "three-piece",
        price: 2400,
        tags: ["three piece", "থ্রিপিস", "blue", "embroidered"],
        imageUrl:
          "https://i.ibb.co/5nmpXSn/blue-threepiece.jpg",
        description_bn:
          "এমব্রয়ডারি ব্লু থ্রিপিস—ডেইলি এবং পার্টির জন্য পারফেক্ট।",
        colors: ["নীল"],
        sizes: ["M", "L", "XL"],
        stock: 12,
      },
      {
        name_bn: "রেড কাতান সিল্ক শাড়ি",
        name_en: "Red Katan Silk Sharee",
        category: "sharee",
        price: 3500,
        tags: ["sharee", "শাড়ি", "katan", "red"],
        imageUrl:
          "https://i.ibb.co/T2b4mJb/red-silk-sharee.jpg",
        description_bn:
          "রেড কালারের কাতান সিল্ক শাড়ি, বিয়ের ফাংশনের জন্য চমৎকার।",
        colors: ["লাল"],
        sizes: [],
        stock: 15,
      },
      {
        name_bn: "সাদা-কালো কটন শাড়ি",
        name_en: "Black & White Cotton Sharee",
        category: "sharee",
        price: 1600,
        tags: ["sharee", "cotton", "cotton sharee", "white", "black"],
        imageUrl:
          "https://i.ibb.co/8bnqGSH/white-black-cotton-sharee.jpg",
        description_bn:
          "হালকা ও আরামদায়ক কটন শাড়ি—ডেইলি ইউজের জন্য আদর্শ।",
        colors: ["সাদা", "কালো"],
        sizes: [],
        stock: 20,
      },
    ];

    await Product.insertMany(products);

    return NextResponse.json({
      success: true,
      message: "৪টি প্রোডাক্ট successfully seed করা হয়েছে 🎉",
    });
  } catch (err: any) {
    console.log(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filename, dataUrl } = body;
    if (!dataUrl)
      return NextResponse.json({ error: "No data" }, { status: 400 });

    // NOTE: demo implementation — store data URL as-is and return that URL.
    // Replace with real storage (S3/Yandex Object Storage) in production.
    return NextResponse.json({ url: dataUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

import path from 'path';
import fs from 'fs';
import { writeFile } from "fs/promises";
import { NextResponse } from 'next/server';

export async function POST(request: any) {
  const uploadDir = path.join(process.cwd(), 'public', 'product-photo');

  // Check if the directory exists, create if doesnt
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const formData = await request.formData();
  const file = formData.get('photo');
  console.log(file)

  if (!file) {
    return NextResponse.json(
      { message: 'Tidak Ada File yang Diupload' }, 
      { status: 400 }
    );
  }

  // validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Tipe file tidak didukung' }, 
        { status: 400 }
      );
    }

  // Convert the file data to a Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Replace spaces in the file name with underscores
  const filename = file.name.replaceAll(" ", "_");

  try {
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json(
      { message: 'File Berhasil Diupload' }, 
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: 'Error memproses file' }, 
      { status: 500 }
    )
  }
}
import path from 'path';
import formidable from 'formidable';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { IncomingMessage } from 'http';

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/product-photo');

export function POST(request: NextRequest) {
  const form = formidable({ uploadDir, keepExtensions: true });

  // Convert NextRequest to IncomingMessage
  const incomingRequest = request as unknown as IncomingMessage;
  
  return new Promise((resolve, reject) => {
    form.parse(incomingRequest, async (err, fields, files) => {
      if (err) {
        return reject(NextResponse.json(
          { message: 'Error memproses file' }, 
          { status: 500 }
        ));
      }

      // Check if the directory exists, create if doesnt
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const file = files.photo;
      if (file && file.length > 0) {
        const oldPath = file[0].filepath;
        const newPath = path.join(uploadDir, file[0].originalFilename as string);
        fs.renameSync(oldPath, newPath);

        return resolve(
          NextResponse.json(
            { message: 'File Berhasil Diupload' }, 
            { status: 200 }
          )
        );
      } else {
        return reject(
          NextResponse.json(
            { message: 'Tidak Ada File yang Diupload' }, 
            { status: 400 }
          )
        );
      }
    })
  })
}
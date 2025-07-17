import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads', // make sure this folder exists
    filename: (_req, file, callback) => {
      const unique = uuid();
      const ext = extname(file.originalname);
      callback(null, `${unique}${ext}`);
    },
  }),
};

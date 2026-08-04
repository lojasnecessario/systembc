import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dirs = [
  path.join(rootDir, 'public'),
  path.join(rootDir, 'public', 'DEP')
];

const extensions = ['.png', '.jpg', '.jpeg', '.webp'];

async function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();
    // Pula arquivos favicon, icones e posters de video que ja definimos na index
    if (file.includes('favicon') || file.includes('icons') || file.includes('poster')) continue;
    
    if (extensions.includes(ext)) {
       const avifPath = fullPath.replace(new RegExp(`${ext}$`, 'i'), '.avif');
       
       try {
         await sharp(fullPath)
           .avif({ quality: 65, effort: 4 })
           .toFile(avifPath);
           
         console.log(`Convertido: ${file} -> ${path.basename(avifPath)}`);
         
         // Remove o original apenas se o avif foi gerado com sucesso
         if (fs.existsSync(avifPath)) {
            fs.unlinkSync(fullPath);
         }
       } catch (err) {
         console.error(`Erro ao converter ${file}:`, err.message);
       }
    }
  }
}

async function run() {
  for (const dir of dirs) {
    await processDir(dir);
  }
  
  // Update Testimonials.tsx references
  const testimonialsFile = path.join(rootDir, 'src', 'pages', 'storefront', 'Testimonials.tsx');
  if (fs.existsSync(testimonialsFile)) {
    let content = fs.readFileSync(testimonialsFile, 'utf8');
    content = content.replace(/\.jpeg/g, '.avif');
    fs.writeFileSync(testimonialsFile, content);
    console.log('Atualizado Testimonials.tsx');
  }
}

run();

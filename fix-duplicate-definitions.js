/**
 * Script para eliminar definiciones duplicadas en el código JS compilado
 * Este script busca patrones comunes de duplicación y los corrige
 */
const fs = require('fs');
const path = require('path');

console.log('🔍 Buscando definiciones duplicadas en el código JS...');

// Directorios donde buscar
const distDir = path.join(__dirname, 'dist');
const jsDir = path.join(distDir, 'js');

// Buscar en el directorio js si existe
if (fs.existsSync(jsDir)) {
  const files = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
  files.forEach(file => processJsFile(path.join(jsDir, file)));
} else {
  console.log('⚠️ El directorio /dist/js no existe');
}

function processJsFile(filePath) {
  const fileName = path.basename(filePath);
  console.log(`⚙️ Procesando ${fileName}...`);
  
  try {
    // Leer el archivo
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Patrones para buscar definiciones duplicadas
    const patterns = [
      // Funciones duplicadas
      {
        regex: /(function\s+(\w+)\s*\([^)]*\)\s*\{[\s\S]*?\})\s*\1/g,
        replacement: (match, func, name) => {
          console.log(`✅ Eliminada función duplicada: ${name}`);
          return func;
        }
      },
      
      // Variables duplicadas con const/let/var
      {
        regex: /((const|let|var)\s+(\w+)\s*=\s*[^;]+;)\s*\1/g,
        replacement: (match, declaration, type, name) => {
          console.log(`✅ Eliminada declaración duplicada: ${type} ${name}`);
          return declaration;
        }
      },
      
      // Clases duplicadas
      {
        regex: /(class\s+(\w+)[\s\S]*?\{\s*[\s\S]*?\})\s*\1/g,
        replacement: (match, classDecl, name) => {
          console.log(`✅ Eliminada clase duplicada: ${name}`);
          return classDecl;
        }
      },
      
      // Importaciones duplicadas
      {
        regex: /(import\s+.*?from\s+['"].*?['"];)\s*\1/g,
        replacement: (match, importStmt) => {
          console.log(`✅ Eliminada importación duplicada`);
          return importStmt;
        }
      },
      
      // Declaraciones duplicadas de WebSAPCache
      {
        regex: /(window\.WebSAPCache\s*=\s*\{[\s\S]*?\};)\s*\1/g,
        replacement: (match, declaration) => {
          console.log(`✅ Eliminada declaración duplicada de WebSAPCache`);
          return declaration;
        }
      },
      
      // Inicializaciones duplicadas de IndexedDB
      {
        regex: /(const\s+request\s*=\s*indexedDB\.open\([^)]+\);)[\s\S]{0,100}\1/g,
        replacement: (match, declaration) => {
          const lines = match.split('\n');
          if (lines.length > 5) {
            // Solo si parece una duplicación real (muchas líneas entre medio)
            console.log(`✅ Eliminada inicialización duplicada de IndexedDB`);
            return declaration;
          }
          return match;
        }
      }
    ];
    
    // Aplicar los patrones
    let modified = false;
    
    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        content = content.replace(pattern.regex, pattern.replacement);
        modified = true;
      }
    }
    
    // Guardar el archivo si se hicieron cambios
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Se eliminaron definiciones duplicadas en ${fileName}`);
    } else {
      console.log(`ℹ️ No se encontraron definiciones duplicadas en ${fileName}`);
    }
    
  } catch (error) {
    console.error(`❌ Error al procesar ${fileName}:`, error);
  }
}

console.log('✅ Finalizada la búsqueda y corrección de definiciones duplicadas');
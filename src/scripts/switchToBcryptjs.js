const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files in a directory
function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules') {
      fileList = findJsFiles(filePath, fileList);
    } else if (stat.isFile() && path.extname(file) === '.js') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to replace bcrypt with bcryptjs in a file
function replaceBcryptInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace require statements
    content = content.replace(/require\(['"]bcrypt['"]\)/g, "require('bcryptjs')");
    
    // Replace import statements
    content = content.replace(/import\s+(\w+)\s+from\s+['"]bcrypt['"]/g, "import $1 from 'bcryptjs'");
    
    // If content was changed, write it back to the file
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('Searching for JavaScript files...');
  const jsFiles = findJsFiles(path.join(__dirname, '..'));
  console.log(`Found ${jsFiles.length} JavaScript files.`);
  
  let updatedCount = 0;
  
  jsFiles.forEach(file => {
    if (replaceBcryptInFile(file)) {
      updatedCount++;
    }
  });
  
  console.log(`\nCompleted! Updated ${updatedCount} files to use bcryptjs instead of bcrypt.`);
}

main();

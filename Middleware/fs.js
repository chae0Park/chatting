const fs = require('fs');
const path = require('path');

// Read Image file
async function readImageFile(filename) {
  const filePath = path.join(__dirname, 'uploads', filename);
  try {
    const data = await fs.promises.readFile(filePath);
    return data;
  } catch (error) {
    throw new Error('Error reading image file');
  }
}

// Write Image file
async function writeImageFile(filename, data) {
  const filePath = path.join(__dirname, 'uploads', filename);
  try {
    await fs.promises.writeFile(filePath, data);
  } catch (error) {
    throw new Error('Error writing image file');
  }
}

module.exports = { readImageFile, writeImageFile };

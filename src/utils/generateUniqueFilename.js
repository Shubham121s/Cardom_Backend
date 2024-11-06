const generateUniqueFilename = (extension) => {
    return `${Date.now()}_${Math.random()}.${extension}`;
  };
  
  module.exports = generateUniqueFilename;
  
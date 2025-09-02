// MongoDB stub for build process
export default {};
export const MongoClient = () => {
  throw new Error('MongoDB is only available in Electron environment');
};
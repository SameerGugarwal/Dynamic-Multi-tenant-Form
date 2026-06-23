import Permission from '../../database/models/Permission.model.mjs';

export const getAllPermissions = async()=>{
    return await Permission.find({}).sort({module: 1, name: 1}).lean();
};
//Bulk seed permissions into the database
export const seedPermissions = async (permissionsList) => {
  const operations = permissionsList.map(perm => ({
    updateOne: {
      filter: { name: perm.name },
      update: { $set: perm },
      upsert: true
    }
  }));
  
  return await Permission.bulkWrite(operations);
};
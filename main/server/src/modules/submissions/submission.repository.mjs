import { Submission } from "../../database/index.mjs";

export const create = async(data)=>{
    return await Submission.create(data);
};
export const findById = async(id)=>{
    return await Submission.findById(id);
};
export const update = async(id, data)=>{
    return await Submission.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
};

export const findPaginated = async (filter, pagination) => {
  const { skip, limit } = pagination;

  const total = await Submission.countDocuments(filter);
  const data = await Submission.find(filter)
    .populate('userId', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  return { total, data };
};
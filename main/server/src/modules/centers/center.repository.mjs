import { Center } from '../../database/index.mjs';

export const findCenterByName = async (name) => {
    return await Center.findOne({ name });
};

export const findCenterById = async (id) => {
    return await Center.findById(id);
};

export const createCenter = async (centerData) => {
    return await Center.create(centerData);
};

export const findAllCenters = async () => {
    return await Center.find();
};

export const updateCenter = async (centerId, updateData) => {
    return await Center.findByIdAndUpdate(centerId, updateData, { new: true, runValidators: true });
};

export const deleteCenterById = async (id) => {
    return await Center.findByIdAndDelete(id);
};

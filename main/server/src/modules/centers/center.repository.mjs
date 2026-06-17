import { Center } from '../../database/index.mjs';

export const findCenterByName = async (name) => {
    return await Center.findOne({ name });
};

export const createCenter = async (centerData) => {
    return await Center.create(centerData);
};

export const findAllCenters = async () => {
    return await Center.find();
};

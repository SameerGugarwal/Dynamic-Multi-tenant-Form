// managing the center 
import * as centerRepo from './center.repository.mjs';

export const createCenter = async (centerData) => {
    const existingCenter = await centerRepo.findCenterByName(centerData.name);
    if (existingCenter) {
        throw new Error('Center already exists');
    }
    return await centerRepo.createCenter(centerData);
};

export const getAllCenters = async () => {
    return await centerRepo.findAllCenters();
};
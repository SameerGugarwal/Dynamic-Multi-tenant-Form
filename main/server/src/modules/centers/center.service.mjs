// managing the center 
import * as centerRepo from './center.repository.mjs';
import { AppError } from '../../shared/utils/errors.mjs';

export const createCenter = async (centerData) => {
    const existingCenter = await centerRepo.findCenterByName(centerData.name);
    if (existingCenter) {
        throw new AppError('Center already exists', 400);
    }
    return await centerRepo.createCenter(centerData);
};

export const getCenterById = async (id) => {
    return await centerRepo.findCenterById(id);
};

export const getAllCenters = async () => {
    return await centerRepo.findAllCenters();
};

export const updateCenter = async (centerId, updateData) => {
    return await centerRepo.updateCenter(centerId, updateData);
};
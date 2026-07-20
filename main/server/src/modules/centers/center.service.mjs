// managing the center 
import * as centerRepo from './center.repository.mjs';
import * as orgRepo from '../organizations/organization.repository.mjs';
import * as userRepo from '../users/user.repository.mjs';
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

export const deleteCenter = async (centerId) => {
    // Delete all users directly assigned to this center
    await userRepo.deleteUsersByCenterId(centerId);
    
    // Find all organizations belonging to this center
    const orgs = await orgRepo.findOrganizationsByCenter(centerId);
    
    // Delete users inside those orgs, then delete the orgs
    for (const org of orgs) {
        await userRepo.deleteUsersByOrganizationId(org._id);
        await orgRepo.deleteOrganizationById(org._id);
    }
    
    // Finally delete the center itself
    return await centerRepo.deleteCenterById(centerId);
};
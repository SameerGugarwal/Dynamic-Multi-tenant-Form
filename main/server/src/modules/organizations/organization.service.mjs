//org. ko initialize karo 

import * as orgRepo from './organization.repository.mjs';
import { AppError } from '../../shared/utils/errors.mjs';

export const createOrganization = async (orgData) => {
    const existingOrg = await orgRepo.findOrganizationByName(orgData.name);
    if (existingOrg) {
        throw new AppError('Organization already exists', 400);
    }
    return await orgRepo.createOrganization(orgData);
};
export const getOrganizationsByCenter = async (centerId) => {
    return await orgRepo.findOrganizationsByCenter(centerId);
};
export const getAllOrganizations = async () => {
    return await orgRepo.findAllOrganizations();
};

export const updateOrganization = async (orgId, updateData) => {
    return await orgRepo.updateOrganization(orgId, updateData);
};

export const getOrganizationInfo = async (orgId) => {
    return await orgRepo.getOrganizationInfo(orgId);
};

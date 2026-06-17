//org. ko initialize karo 

import * as orgRepo from './organization.repository.mjs';

export const createOrganization = async (orgData) => {
    const existingOrg = await orgRepo.findOrganizationByName(orgData.name);
    if (existingOrg) {
        throw new Error('Organization already exists');
    }
    return await orgRepo.createOrganization(orgData);
};
export const getOrganizationsByCenter = async (centerId) => {
    return await orgRepo.findOrganizationsByCenter(centerId);
};
export const getAllOrganizations = async () => {
    return await orgRepo.findAllOrganizations();
};
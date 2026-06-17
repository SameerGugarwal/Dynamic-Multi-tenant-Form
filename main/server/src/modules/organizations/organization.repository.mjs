import { Organization } from "../../database/index.mjs";

export const findOrganizationByName = async (name) => {
    return await Organization.findOne({ name });
};

export const createOrganization = async (orgData) => {
    return await Organization.create(orgData);
};

export const findOrganizationsByCenter = async (centerId) => {
    return await Organization.find({ centers: centerId });
};

export const findAllOrganizations = async () => {
    return await Organization.find();
};

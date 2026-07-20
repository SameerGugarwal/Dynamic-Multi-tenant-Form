import { Organization } from "../../database/index.mjs";

export const findOrganizationByName = async (name) => {
    return await Organization.findOne({ name });
};

export const createOrganization = async (orgData) => {
    return await Organization.create(orgData);
};

export const findOrganizationsByCenter = async (centerId) => {
    return await Organization.find({ centers: centerId }).populate('centers', 'name');
};

export const findAllOrganizations = async () => {
    return await Organization.find().populate('centers', 'name');
};


export const updateOrganization = async (orgId, updateData) => {
    return await Organization.findByIdAndUpdate(orgId, updateData, { new: true, runValidators: true });
};

export const getOrganizationInfo = async (orgId) => {
    const org = await Organization.findById(orgId).populate('centers', 'name');
    if (!org) return null;
    const { User } = await import('../../database/index.mjs');
    const userCount = await User.countDocuments({ organizationId: orgId });
    return { ...org.toObject(), userCount };
};

export const deleteOrganizationsByCenterId = async (centerId) => {
    return await Organization.deleteMany({ centers: centerId });
};

export const deleteOrganizationById = async (orgId) => {
    return await Organization.findByIdAndDelete(orgId);
};

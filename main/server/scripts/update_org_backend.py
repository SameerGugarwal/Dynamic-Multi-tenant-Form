import os
import re

base_dir = "/Users/sameerchoudhary/Desktop/project/Dynamic Multi-tenant Form /main/server/src/modules/organizations/"

repo_path = os.path.join(base_dir, "organization.repository.mjs")
with open(repo_path, 'r') as f:
    content = f.read()

content = content.replace("await Organization.find()", "await Organization.find().populate('centers', 'name')")
content = content.replace("await Organization.find({ centers: centerId })", "await Organization.find({ centers: centerId }).populate('centers', 'name')")

new_funcs = """
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
"""
if "updateOrganization" not in content:
    content += "\n" + new_funcs

with open(repo_path, 'w') as f:
    f.write(content)

service_path = os.path.join(base_dir, "organization.service.mjs")
with open(service_path, 'r') as f:
    content = f.read()

new_svc = """
export const updateOrganization = async (orgId, updateData) => {
    return await orgRepo.updateOrganization(orgId, updateData);
};

export const getOrganizationInfo = async (orgId) => {
    return await orgRepo.getOrganizationInfo(orgId);
};
"""
if "updateOrganization" not in content:
    content += "\n" + new_svc

with open(service_path, 'w') as f:
    f.write(content)

ctrl_path = os.path.join(base_dir, "organization.controller.mjs")
with open(ctrl_path, 'r') as f:
    content = f.read()

new_ctrl = """
export const updateOrganization = async (req, res, next) => {
    try {
        const orgId = req.params.id;
        const updatedOrg = await organizationService.updateOrganization(orgId, req.body);
        if (!updatedOrg) return errorResponse(res, 404, 'Organization not found');
        return successResponse(res, 200, 'Organization updated successfully', updatedOrg);
    } catch(error) {
        next(error);
    }
};

export const getOrganizationInfo = async (req, res, next) => {
    try {
        const orgId = req.params.id;
        const info = await organizationService.getOrganizationInfo(orgId);
        if (!info) return errorResponse(res, 404, 'Organization not found');
        return successResponse(res, 200, 'Organization info fetched', info);
    } catch(error) {
        next(error);
    }
};
"""
if "updateOrganization" not in content:
    content += "\n" + new_ctrl

with open(ctrl_path, 'w') as f:
    f.write(content)

routes_path = os.path.join(base_dir, "organization.routes.mjs")
with open(routes_path, 'r') as f:
    content = f.read()

content = content.replace("createNewOrg, getOrg, getAllOrgs, getCenterOrgs", "createNewOrg, getOrg, getAllOrgs, getCenterOrgs, updateOrganization, getOrganizationInfo")

new_routes = """
router.patch('/:id', authorizeRoles('Super Admin'), updateOrganization);
router.get('/:id/info', authorizeRoles('Super Admin', 'Center Admin'), getOrganizationInfo);
"""
if "updateOrganization" not in content:
    content = content.replace("export default router;", new_routes + "\nexport default router;")

with open(routes_path, 'w') as f:
    f.write(content)
print("Backend updated.")


import express from 'express';
import { protect } from '../../middleware/auth.middleware.mjs';
import Center from '../../database/models/Center.model.mjs';
import Organization from '../../database/models/Organization.model.mjs';
import Form from '../../database/models/Form.model.mjs';
import Submission from '../../database/models/Submission.model.mjs';

const router = express.Router();

router.get('/stats', protect, async (req, res) => {
    try {
        let queryCenter = {};
        let queryOrg = {};
        let queryForm = {};
        let querySub = {};
        let queryUser = {};

        console.log("Dashboard Stats Requested by:", req.user.email, "Role:", req.user.role?.name);

        if (req.user.role?.name === 'Super Admin') {
            queryCenter = {};
            queryOrg = {};
            queryForm = { clonedFromId: null };
            querySub = {};
            queryUser = {};
        } else if (req.user.role?.name === 'Center Admin') {
            const orgs = await Organization.find({ centers: req.user.centerId }).select('_id');
            const orgIds = orgs.map(o => o._id);
            console.log("Found Orgs for Center Admin:", orgIds);
            
            queryOrg = { _id: { $in: orgIds } };
            // Center Admin's Forms count should reflect the Master Templates available to them, matching the Forms tab
            queryForm = { visibility: 'PUBLIC', isMaster: true, clonedFromId: null };
            querySub = { organizationId: { $in: orgIds } };
            queryCenter = { _id: req.user.centerId };
            queryUser = { organizationId: { $in: orgIds } };
        } else if (req.user.role?.name === 'Organization Admin') {
            queryOrg = { _id: req.user.organizationId };
            queryForm = { organizationId: req.user.organizationId };
            querySub = { organizationId: req.user.organizationId };
            queryCenter = { _id: null };
            queryUser = { organizationId: req.user.organizationId };
        } else if (req.user.role?.name === 'User') {
            queryOrg = { _id: req.user.organizationId };
            queryForm = { organizationId: req.user.organizationId, status: 'PUBLISHED' };
            querySub = { organizationId: req.user.organizationId };
            queryCenter = { _id: null };
            queryUser = { organizationId: req.user.organizationId };
        }

        const centers = await Center.countDocuments(queryCenter);
        const orgsCount = await Organization.countDocuments(queryOrg);
        const forms = await Form.countDocuments(queryForm);
        const submissions = await Submission.countDocuments(querySub);
        
        // Also need to import User at the top of the file!
        const { default: User } = await import('../../database/models/User.model.mjs');
        const users = await User.countDocuments(queryUser);
        
        let pendingForms = 0;
        let completedForms = 0;
        
        if (req.user.role?.name === 'User') {
            // How many unique forms has this user submitted?
            const userSubmissions = await Submission.distinct('formId', { userId: req.user._id });
            completedForms = userSubmissions.length;
            // Forms assigned to org that the user hasn't submitted yet
            // Total org forms - completed forms = pending forms
            // Just forms count - completedForms
            pendingForms = Math.max(0, forms - completedForms);
        }

        console.log("Final Counts:", { centers, orgs: orgsCount, forms, submissions, users, pendingForms, completedForms });
        res.json({ success: true, data: { centers, orgs: orgsCount, forms, submissions, users, pendingForms, completedForms } });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

export default router;

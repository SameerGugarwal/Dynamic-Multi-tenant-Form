
import express from 'express';
import { protect } from '../../middleware/auth.middleware.mjs';
import Center from '../../database/models/Center.model.mjs';
import Organization from '../../database/models/Organization.model.mjs';
import Form from '../../database/models/Form.model.mjs';
import Submission from '../../database/models/Submission.model.mjs';

const router = express.Router();

router.get('/stats', protect, async (req, res) => {
    try {
        const centers = await Center.countDocuments();
        const orgs = await Organization.countDocuments();
        const forms = await Form.countDocuments();
        const submissions = await Submission.countDocuments();
        
        res.json({ success: true, data: { centers, orgs, forms, submissions } });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

export default router;

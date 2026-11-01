import { Router } from 'express';
import { classify } from '../controllers/classify.controller.js';

const router = Router();

router.post('/', classify);

export default router;
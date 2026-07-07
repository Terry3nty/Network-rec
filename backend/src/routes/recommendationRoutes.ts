import { Router } from 'express';
import { recommendationController } from '../controllers/recommendationController';

const router = Router();

router.get('/recommend', recommendationController.getRecommendation);

export default router;

import { Router } from 'express';
import authRouter from './auth';
import userRouter from './user';
import referenceRouter from './reference';
import teacherRouter from './teacher';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/teacher', teacherRouter);

router.use('/ref', referenceRouter);

export default router;
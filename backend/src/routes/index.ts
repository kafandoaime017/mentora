import { Router } from 'express';
import authRouter from './auth';
import userRouter from './user';
import referenceRouter from './reference';
import teacherRouter from './teacher';
import studentRouter from './students';
import aiRoutes from './ai';
import notificationRoutes from './notifications';
import adminRoutes from './admin';
import totpRoutes from './totp';
import settingsRouter from './settings';
import superadminRouter from './superadmin';
import stripeRouter from './stripe';
import announcementsRouter from './announcements';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/teacher', teacherRouter);
router.use('/students', studentRouter);
router.use('/ai', aiRoutes)
router.use('/notifications', notificationRoutes)
router.use('/admin', adminRoutes)
router.use('/totp', totpRoutes)
router.use('/settings', settingsRouter)

router.use('/ref', referenceRouter);
router.use('/superadmin', superadminRouter)
router.use('/stripe', stripeRouter)
router.use('/annonces', announcementsRouter)


export default router;
import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ReportController } from './report.controller';

const router = Router();

router.post(
  '/create-report',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  ReportController.createReport,
);

router.get('/', auth(USER_ROLES.ADMIN), ReportController.getAllReports);

router.get('/:id', auth(USER_ROLES.ADMIN), ReportController.getReportDetails);

export const ReportRoutes = router;

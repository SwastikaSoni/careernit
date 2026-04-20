import { Router } from 'express';
import { sendContactMessage, getContactInfo } from '../controllers/contactController';
import validate from '../middlewares/validate';
import { contactSchema } from '../validators/contactValidator';

const router = Router();

router.post('/', validate(contactSchema), sendContactMessage);
router.get('/info', getContactInfo);

export default router;

const router = require('express').Router();
const multer = require('multer');
const dc = require('../controllers/documentController');
const { authMiddleware, rbacMiddleware } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(authMiddleware);

router.get('/', dc.list);
router.get('/search', dc.search);
router.get('/:id', dc.getById);
router.get('/:id/download', dc.download);
router.get('/:id/versions', dc.getVersions);
router.post('/upload', rbacMiddleware('admin', 'operador'), upload.single('file'), dc.upload);
router.post('/:id/versions', rbacMiddleware('admin', 'operador'), upload.single('file'), dc.createVersion);
router.put('/:id/metadata', rbacMiddleware('admin', 'operador'), dc.updateMetadata);
router.put('/:id/inactivate', rbacMiddleware('admin', 'operador'), dc.inactivate);
router.put('/:id/reactivate', rbacMiddleware('admin', 'operador'), dc.reactivate);

module.exports = router;

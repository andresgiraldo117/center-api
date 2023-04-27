const { Router } = require('express');
const { apikey, verifyToken, isUser } = require('../middlewares/AuthJWT')
const { ClassLanding } = require('../controllers/Landing.controller');
const ClassBoards = require('../controllers/Boards.controller');
const router = Router();

router.get('/', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassLanding.getAll(req.user);
        res.json(response);
    } catch (error) {
        next(error);
    }
});
router.post('/status/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const Board = await ClassBoards.update(req.user, req.params.id, req.body);
        res.status(200).json(Board);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassLanding.getById(req.user, req.params.id);
        res.json(response);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassLanding.update(req.user, req.params.id, req.body);
        res.json(response);
    } catch (error) {
        next(error);
    }
});


module.exports = router;
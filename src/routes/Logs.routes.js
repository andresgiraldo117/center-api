const { Router } = require('express');
const { apikey, verifyToken, isUser } = require('../middlewares/AuthJWT')
const router = Router();
const ClassLog = require('../controllers/Logs.controller');

router.get('/:id', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const response = await ClassLog.getById(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        res.status(400);
        next(error);
    }
});

router.get('/analyticBoard/:id', apikey, verifyToken, isUser, async( req, res, next ) => {
    try {
        const response = await ClassLog.analyticsBoard(req.user, req.params.id, req.body);
        res.json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const response = await ClassLog.getLogs(req.user, req.body);
        res.status(200).json(response);
    } catch (error) {
        res.status(400);
        next(error);
    }
});

router.get('/user/:idLead/:idBoard', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const response = await ClassLog.getLogBySeller(req.user, req.params.idLead, req.params.idBoard);
        res.status(200).json(response);
    } catch (error) {
        res.status(400);
        next(error);
    }
});


module.exports = router;
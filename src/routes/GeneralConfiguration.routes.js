const { Router } = require('express');
const GeneralConfigController = require('../controllers/GeneralConfiguration.controller');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const router = Router();

router.post('/', async(req, res, next) => {
    try {
        const response = await GeneralConfigController.create(req.body);
        res.json(response);  
    } catch (error) {
        next(error);
    }
});

router.get('/:id', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await GeneralConfigController.getAllById(req.user, req.params);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await GeneralConfigController.getAll(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.put('/', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await GeneralConfigController.update(req.user, req.params.id, req.body);
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});

router.delete('/', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await GeneralConfigController.deleteAll();
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});



module.exports = router;

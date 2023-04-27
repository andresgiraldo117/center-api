const { Router } = require('express');
const ClassFormat = require('../controllers/Format.controller.js');
const { apikey, verifyToken, isUser, } = require('./../middlewares/AuthJWT');
const router = Router();

router.post('/', async(req, res, next) => {
    try {
        const Format = await ClassFormat.create(req.body);
        res.json(Format);  
    } catch (error) {
        next(error);
    }
});

router.get('/:id', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await ClassFormat.getById(req.user, req.params.id);
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});

router.get('/', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const formats = await ClassFormat.getAllFormats(req.user); 
        res.json(formats);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const format = await ClassFormat.delete(req.user, req.params.id); 
        res.json(format);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const format = await ClassFormat.update(req.user, req.params.id, req.body); 
        res.json(format);
    } catch (error) {
        next(error);
    }
});

router

module.exports = router;

const { Router } = require('express');
const ClassFiles = require('../controllers/Files.controller');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const router = Router();
const Boom = require('@hapi/boom');
const { body, validationResult } = require('express-validator');

router.post('/', async(req, res, next) => {
    try {
        const files = await ClassFiles.create(req.body);
        res.json(files);  
    } catch (error) {
        next(error);
    }
});

router.get('/:id', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await ClassFiles.getAllById(req.user, req.params);
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});

router.get('/', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await ClassFiles.getAll(req.user);
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await ClassFiles.deleteById(req.user, req.params.id);
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});

router.delete('/', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await ClassFiles.deleteAll();
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});



module.exports = router;

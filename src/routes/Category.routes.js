const { Router } = require('express');
const ClassCategory = require('../controllers/Category.controller.js');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const router = Router();
const Boom = require('@hapi/boom');
const { body, validationResult } = require('express-validator');

router.post('/', apikey, verifyToken, isUser,  
    body('name').not().isEmpty().trim().isLength({min: 3}),
    body('type').not().isEmpty().trim().isLength({min:3}),
    async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.badData(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        }
        const response = await ClassCategory.create(req.user, req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassCategory.getAll(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.put('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassCategory.update(req.user, req.params.id, req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});
router.get('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassCategory.getById(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassCategory.delete(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});


module.exports = router;
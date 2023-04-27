const { Router } = require('express');
const ClassNotifications = require('../controllers/Notifications.controller');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const router = Router();
const Boom = require('@hapi/boom');
const { body, validationResult } = require('express-validator');

router.post('/', apikey, verifyToken, isUser,
    body('title').not().isEmpty().trim(),
    body('description').not().isEmpty().trim().isNumeric(),
    body('id_user').not().isEmpty().trim().isHexadecimal(),
    body('status_admin').not().isEmpty().trim(),
    body('status_user').not().isEmpty().trim(),
    body('status_email').not().isEmpty().trim(),
    async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.badData(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        }
        const response = await ClassNotifications.create(req.user, req.body, req.files);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassNotifications.getAll(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassNotifications.getById(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.put('/',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassNotifications.update(req.user, req.params.id, req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassNotifications.deletePauta(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.delete('/',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassNotifications.deletePa(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
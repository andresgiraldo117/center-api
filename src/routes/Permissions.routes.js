const { Router } = require('express');
const ClassPermissions = require('../controllers/Permissions.controller');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const Boom = require('@hapi/boom');
const router = Router();
const { body, validationResult } = require('express-validator');


router.post('/', apikey, verifyToken, isUser,
    async(req,res, next) => {
    try {
        const newPermission = await ClassPermissions.create(req.user, req.body);
        res.json(newPermission)
    } catch (error) {
        next(error);
    }
});

router.get('/:id', apikey, verifyToken, isUser, async( req, res, next ) => {
    try {
        const Board = await ClassPermissions.getById(req.user, req.params.id);
        res.json(Board);
    } catch (error) {
        next(error);
    }
});



router.get('/', apikey, verifyToken, isUser, async( req, res, next) => {
    try {
        const permissions = await ClassPermissions.getAll(req.user);
        res.json(permissions);
    } catch (error) {
        next(error);
    }
});

router.post('/:id', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const permission = await ClassPermissions.addPermission(req.user, req.params.id, req.body);
        res.status(200).json(permission);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const permission = await ClassPermissions.update(req.user, req.params.id, req.body);
        res.status(200).json(permission);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const Board = await ClassPermissions.delete(req.user, req.params.id, req.body);
        res.json(Board);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
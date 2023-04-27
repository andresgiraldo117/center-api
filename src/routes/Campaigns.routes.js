const { Router } = require('express');
const ClassCampaign = require('../controllers/Campaign.controller');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const router = Router();
const Boom = require('@hapi/boom');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const express = require('express');

const storage = multer.diskStorage({
    destination: `Multimedia/`,
    filename: function (req,file,cb) {
        cb("",file.originalname);
    }
});

let upload = multer({
    storage
});

router.post('/', apikey, verifyToken, isUser, upload.array('archivos'),
    body('name').not().isEmpty().trim(),
    async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.badData(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        }
        const response = await ClassCampaign.create(req.user, req.body, req.files);
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get('/',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        //const response = await ClassCampaign.getAll(req.user);
        const response = await ClassCampaign.getBoardById(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassCampaign.getById(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        console.log(error)
    }
});

/* router.get('/board',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassCampaign.getBoardById(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
}); */

router.use('/getfile', express.static('./Multimedia/'));

router.put('/:id',apikey, verifyToken, isUser, upload.array('archivos'), 
    async(req, res, next) => {
    try {
        const response = await ClassCampaign.update(req.user, req.params.id, req.body, req.files);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.put('/change-status/:id',apikey, verifyToken, isUser, upload.array('archivos'),
    async(req, res, next) => {
    try {
        const response = await ClassCampaign.updateStatus(req.user, req.params.id, req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassCampaign.delete(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.delete('/',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassCampaign.deleteAll(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
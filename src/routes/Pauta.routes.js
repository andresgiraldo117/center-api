const { Router } = require('express');
const ClassPauta = require('../controllers/Pauta.controller.js');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const router = Router();
const Boom = require('@hapi/boom');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const express = require('express');

/* const storage = multer.diskStorage({
    destination: `Multimedia/`,
    filename: function (req,file,cb) {
        cb("",file.originalname);
    }
});

let upload = multer({
    storage
}); */

router.post('/', apikey, verifyToken, isUser,  /* upload.array('archivos'), */
    body('geography').not().isEmpty().trim(),
    body('id_board').not().isEmpty().trim().isHexadecimal(),
    body('id_campaign').not().isEmpty().trim(),
    body('range').not().isEmpty().trim(),
    body('genre').not().isEmpty().trim(),

    async(req, res, next) => {
    try {
        /*  const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.badData(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        } */
        const response = await ClassPauta.create(req.user, req.body, req.files);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassPauta.getAll(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassPauta.getById(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.use('/getfile', express.static('./Multimedia/'));

router.put('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassPauta.update(req.user, req.params.id, req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassPauta.deletePauta(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.delete('/',apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassPauta.deletePa(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/anality/:idBoard', apikey, verifyToken, isUser, async(req,res,next) => {
    try {
        const { idBoard } = req.params;
        const { year, month } = req.body
        const response = await ClassPauta.anality(req.user, { idBoard, year, month});
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
})

module.exports = router;
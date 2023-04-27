const { Router } = require('express');
const ClassConfigurationAccount = require('../controllers/ConfigurationAcc.controller');
const { verifyToken, apikey, isUser } = require('../middlewares/AuthJWT');
const router = Router();
const Boom = require('@hapi/boom');
const multer = require('multer');
const express = require('express');

const storage = multer.diskStorage({
    destination: `Multimedia_Accounts/`,
    filename: function (req,file,cb) {
        cb("",file.originalname);
    }
});

let upload = multer({
    storage
});


router.get('/', apikey, verifyToken, isUser, async (req, res, next) =>{
    try {
        const response = await ClassConfigurationAccount.getConfiguration(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error)
    }
});

router.get('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassConfigurationAccount.getById(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.put('/', apikey, verifyToken, isUser, upload.array('archivos'),
    async(req, res, next) => {
    try {
        const response = await ClassConfigurationAccount.update(req.user, req.body, req.files);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassConfigurationAccount.delete(req.user, req.params);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.use('/getfilelogo', express.static('./Multimedia_Accounts/'));


module.exports = router;
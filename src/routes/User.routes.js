const { Router } = require('express');
const { verifyToken, apikey, isUser } = require('../middlewares/AuthJWT');
const ClassSellers = require('../controllers/Users.controller');
const { celebrate, Joi } = require('celebrate');
const Boom = require('@hapi/boom');
const router = Router();
const multer = require('multer');
const mimeTypes = require('mime-types');
const { body, validationResult } = require('express-validator');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req,file,cb) {
        cb("",Date.now() + file.originalname + "." + mimeTypes.extension(file.mimetype));
    }
});

let upload = multer({
    storage
});


router.post('/files', apikey, verifyToken, isUser, upload.single('csv')
,async (req,res) => {
    try {
        const response = await ClassSellers.cargaMasiva(req.user, req.file.filename, req.body.idBoard);
        res.json(response);
    } catch (error) {   
        next(error);
    }
});

router.post('/', apikey, verifyToken, isUser, 
    body('name').not().isEmpty().trim().isLength({min: 3}),
    body('identification_number').not().isEmpty().trim().isNumeric(), 
    body('email').not().isEmpty().trim().isEmail(),
    body('city').not().isEmpty().trim().isLength({min: 3}),
    body('country').not().isEmpty().trim().isLength({min: 3}),
    body('address').not().isEmpty().trim().isLength({min: 3}),
    body('phone').not().isEmpty().trim().isLength({min: 7, max: 10}), 
    body('password').not().isEmpty().trim().isLength({min: 5}),
    async (req, res, next) =>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.badData(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        }
        const response = await ClassSellers.create(req.user, req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.post('/next/',
    body('ip').not().isEmpty().trim().isString(),
    body('url').not().isEmpty().trim().isURL(),
    body('id_pauta').not().isEmpty().trim(),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.badData(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        }
        const response = await ClassSellers.nextS(req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/confirm/:token', async (req, res, next) =>{
    try {
        const response = await ClassSellers.confirm(req.params.token);
        res.redirect('https://stg-smcloud.smdigitalstage.com/');
        res.status(200).json(response);
    } catch (error) {
        res.status(403);
        next(error);
    }
});

router.get('/', verifyToken, apikey, isUser, async (req, res, next) =>{
    try {
        const response = await ClassSellers.getAll(req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', verifyToken, apikey, isUser, async(req, res, next) => {
    try {
        const response = await ClassSellers.getById(req.user, req.params.id);
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/:id/board/:idBoard', verifyToken, apikey, isUser, async(req, res, next) => {
    try {
        const response = await ClassSellers.getById(req.user, req.params.id, req.params.idBoard);
        if(Object.keys(response).length === 0){
            res.status(404);
            throw new Error('No se encontro un usuario con ese ID');
        } 
        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', verifyToken, apikey, isUser, async(req, res, next) => {
    try {
        const response = await ClassSellers.update(req.params.id, req.body, req.user);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassSellers.delete(req.user, req.params.id);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});



module.exports = router;
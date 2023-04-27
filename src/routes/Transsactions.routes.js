const { Router } = require('express');
const ClassTranssactions = require('../controllers/Transsactions.controller');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const router = Router();
const Boom = require('@hapi/boom');
const { body, validationResult } = require('express-validator');

router.post('/', 
    body('status').not().isEmpty().trim(),
    body('type').not().isEmpty().trim().isLength({min: 3}),
    body('details').not().isEmpty().trim().isLength({min: 3}),
    body('amount').not().isEmpty().trim().isNumeric(), 
    body('id_board').not().isEmpty().trim().isHexadecimal(),
    body('id_user').not().isEmpty().trim().isHexadecimal(),
    async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.badData(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        }
        const transsaction = await ClassTranssactions.create(req.body);
        res.json(transsaction);  
    } catch (error) {
        next(error);
    }
});

router.get('/:id', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const response = await ClassTranssactions.getById(req.user, req.params.id);
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});

router.post('/epayco', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const transsaction = await ClassTranssactions.validateEpaycoAndCreate(req.user, req.body)
        res.status(200).json( transsaction );
    } catch (error) {
        next(error);
    }
});

router.post('/tokenepayco', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const transsaction = await ClassTranssactions.tokenEpaycoGenerate(req.user, req.body)
        res.status(200).json( transsaction );
    } catch (error) {
        next(error);
    }
});

router.get('/details/transsactionepayco', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const transsaction = await ClassTranssactions.getAllDetailsTranssationsEpayco()
        res.status(200).json( transsaction );
    } catch (error) {
        next(error);
    }
});

router.get('/validate/transsactionepayco', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const transsaction = await ClassTranssactions.validateDetailsTranssationsEpayco()
        res.status(200).json( transsaction );
    } catch (error) {
        next(error);
    }
});

router.get('/', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const transsactions = await ClassTranssactions.getAll(req.user); 
        res.json(transsactions);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const transsaction = await ClassTranssactions.update(req.user, req.params.id, req.body );
        res.json(transsaction);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const transsaction = await ClassTranssactions.delete(req.user, req.params.id);
        res.json(transsaction);
    } catch (error) {
        next(error);
    }
});



module.exports = router;

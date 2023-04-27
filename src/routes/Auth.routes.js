const { Router } = require('express');
const ClassAuth = require('../controllers/Auth.controller');
const { apikey } = require('./../middlewares/AuthJWT');
const router = Router();
const Boom = require('@hapi/boom');
const { body, validationResult } = require('express-validator');

router.post('/login', apikey, 
    body('email').not().isEmpty().trim().isEmail(),
    body('password').not().isEmpty().trim(),
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.unauthorized(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        }
        const { email, password } = req.body;
        const response = await ClassAuth.login(email, password);
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});

router.post('/signup', 
    body('nit').not().isEmpty().trim().isLength({min: 3}),
    body('name').not().isEmpty().trim().isLength({min: 3}),
    body('email').not().isEmpty().trim().isEmail(), 
    body('city').not().isEmpty().trim().isLength({min: 3}),
    body('country').not().isEmpty().trim().isLength({min: 3}),
    body('address').not().isEmpty().trim().isLength({min: 3}),
    body('phone').not().isEmpty().trim().isLength({min: 7, max: 10}).isNumeric(), 
    body('url').not().isEmpty().trim().isURL(),
    async(req, res, next) => {
    try {
        const errors = validationResult(req);
    if(!errors.isEmpty()){
        throw Boom.unauthorized(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
    }
        const response = await ClassAuth.SignUp(req.body);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

router.put('/forgot-password', 
    body('email').not().isEmpty().trim().isEmail(),
    async(req, res, next) => {
    try {
        const errors = validationResult(req);
    if(!errors.isEmpty()){
        throw Boom.unauthorized(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
    }
        const { email } = req.body;
        const response = await ClassAuth.forgotPassword(email);
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

// router.put('/new-password/:token', 
router.put('/new-password', 
    body('password').not().isEmpty().trim(),
    async(req, res, next) => {
    try {
        const errors = validationResult(req);
    if(!errors.isEmpty()){
        throw Boom.unauthorized(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
    }
        const { password } = req.body;
        // const { token } = req.params;
        const { token } = req.headers;
        const response = await ClassAuth.changePassword({password, token});
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

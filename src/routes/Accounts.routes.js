const { Router } = require('express');
const ClassAccounts = require('../controllers/Accounts.controller');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const router = Router();
const Boom = require('@hapi/boom');
const { body, validationResult } = require('express-validator');

router.post('/', 
    body('type_account').not().isEmpty().trim(),
    body('name').not().isEmpty().trim().isLength({min: 3}),
    body('password').not().isEmpty().trim().isLength({min: 6}),
    body('email').not().isEmpty().trim().isEmail(), 
    async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.badData(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        }
        const Account = await ClassAccounts.create(req.body);
        res.json(Account);  
    } catch (error) {
        console.log(error);
        next(error);
        res.status(200).json( { status: 500, message: error}  );

    }
});

router.get('/:id', apikey, verifyToken, isUser, async (req, res, next) => {
    try {
        const account = new ClassAccounts(req.params.id);
        const response = await account.getById(req.user);
        res.status(200).json( response );
    } catch (error) {
        next(error);
    }
});

router.get('/', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const Accounts = await ClassAccounts.getAll(req.user); 
        res.json(Accounts);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const Account = await ClassAccounts.update(req.user, req.params.id, req.body );
        res.json(Account);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const Account = await ClassAccounts.delete(req.user, req.params.id);
        res.json(Account);
    } catch (error) {
        next(error);
    }
});



module.exports = router;

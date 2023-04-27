const { Router } = require('express');
const ClassBoards = require('../controllers/Boards.controller');
const { verifyToken, apikey, isUser } = require('./../middlewares/AuthJWT');
const Boom = require('@hapi/boom');
const router = Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'Multimedia/',
    filename: function (req,file,cb) {
        cb("", req.body.idFormat + '_' + file.originalname);
    }
});

let upload = multer({
    storage
});

router.get('/files', apikey, verifyToken, isUser, 
    async (req,res, next) => {
        try {
            const {user} = req;
            const response = await ClassBoards.getFiles(user, req.body.idFolder);
            res.json(response);
        } catch (error) {   
            next(error);
        }
    }
);

router.post('/addFiles', apikey, verifyToken, isUser, upload.array('archivo'),
    async (req,res, next) => {
        const {user} = req
        const { idFolder ,idFormat, idAccount} = req.body;
        const response = await ClassBoards.createFiles(user, req.files, idFolder, idFormat, idAccount);
        res.json(response);
    }
);

router.post('/addFolders/:id', apikey, verifyToken, isUser, 
    async (req,res, next) => {
        try {
            const response = await ClassBoards.createFolder(req.user, req.params.id, req.body);
            res.json(response);
        } catch (error) {   
            next(error);
        }
    }
);

router.post('/', apikey, verifyToken, isUser, 
    body('name').not().isEmpty().trim().isLength({min: 3}),
    // body('type').not().isEmpty().trim().isLength({min: 3}),
    body('age').not().isEmpty().trim().isLength({min: 3}),
    // body('url').not().isEmpty().trim().isURL(), 
    // body('id_account').not().isEmpty().trim().isHexadecimal(), 
    async(req,res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw Boom.badData(`The field ${errors.errors[0].param} is ${errors.errors[0].msg} `);
        }
        const newBoard = await ClassBoards.create(req.user, req.body);
        res.json(newBoard)
    /* try {
    } catch (error) {
        next(error);
    } */
});

router.get('/:id', apikey, verifyToken, isUser, async( req, res, next ) => {
    try {
        const Board = await ClassBoards.getById(req.user, req.params.id);
        res.json(Board);
    } catch (error) {
        next(error);
    }
});



router.get('/', apikey, verifyToken, isUser, async( req, res, next) => {
    try {
        const Board = await ClassBoards.getAll(req.user);
        res.json(Board);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const Board = await ClassBoards.update(req.user, req.params.id, req.body);
        res.status(200).json(Board);
    } catch (error) {
        next(error);
    }
});

router.post('/bulkreload', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const Board = await ClassBoards.bulkReload(req.user, req.body);
        res.status(200).json(Board);
    } catch (error) {
        next(error);
    }
});


router.delete('/:id', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const Board = await ClassBoards.delete(req.user, req.params.id);
        res.json(Board);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
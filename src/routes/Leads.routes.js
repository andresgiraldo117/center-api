const { Router } = require('express');
const { apikey, verifyToken, isUser } = require('../middlewares/AuthJWT')
const ClassLeads = require('../controllers/Leads.controller');
const router = Router();

router.get('/', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassLeads.getAll(req.user);
        res.json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassLeads.getById(req.user, req.params.id);
        res.json(response);
    } catch (error) {
        next(error);
    }
});

router.get('/by-board/:id', apikey, verifyToken, isUser, async(req, res, next) => {
    try {
        const response = await ClassLeads.getAllByBoard(req.user, req.params.id);
        res.json(response);
    } catch (error) {
        next(error);
    }
});



module.exports = router;
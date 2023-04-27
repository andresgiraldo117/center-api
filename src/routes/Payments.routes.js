const { Router } = require('express');
const { verifyToken, apikey, isUser } = require('../middlewares/AuthJWT');
const ClassPayments = require('../controllers/Payments.controller');
const router = Router();


router.get('/', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const Payments = await ClassPayments.getAll(req.user);
        res.json(Payments);
    } catch (error) {
        next(error);
    }
});

router.post('/prueba', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        //console.log(req.body)

    } catch (error) {
        next(error);
    }
});

router.post('/', apikey, verifyToken, isUser, async(req,res, next) => {
    try {
        const Payment = await ClassPayments.create(req.user, req.body);
        res.json(Payment);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', apikey, verifyToken, isUser, async(req,res) => {
    try {
        const Payment = await ClassPayments.delete(req.user, req.params.id);
        res.json(Payment);
    } catch (error) {
        //console.log(error);
    }
});

router.put('/',  async(req,res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const Payment = await ClassPayments.update(id, data);
        res.json(Payment);
    } catch (error) {
        //console.log(error);
    }
});

module.exports = router;
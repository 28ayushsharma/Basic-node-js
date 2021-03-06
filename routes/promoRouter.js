const express    = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Promotions = require('../models/promotion');

const promotionRouter = express.Router();
promotionRouter.use(bodyParser.json());


promotionRouter.route('/')
.get((req,res,next) => {
    Promotions.find({})
        .then((promotion)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion);
        },(err)=>{
            next(err);
        }).catch((err)=>{
            next(err);
        });
})
.post(authenticate.verifyUser ,(req,res,next) => {
    Promotions.create(req.body)
    .then((promotion)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        console.log('promotion created'+ promotion);
        res.json(promotion);
    },(err)=>{
        next(err);
    }).catch((err)=>{
        next(err);
    });
})
.put(authenticate.verifyUser ,(req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported by promotions.');
})
.delete(authenticate.verifyUser ,(req,res,next)=>{
    return Promotions.deleteMany({})
        .then((resp)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err)=>{
            next(err);
        }).catch((err)=>{
            next(err);
        });
});

promotionRouter.route('/:promoId')
.get((req,res,next) => {
    Promotions.findById(req.params.promoId)
        .then((promotion)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion);
        },(err)=>{
            next(err);
        }).catch((err)=>{
            next(err);
        });
})
.post(authenticate.verifyUser ,(req,res,next) => {
    res.statusCode = 403;
    res.end('Post operation not supported on promotions : '+ req.params.promoId);
})
.put(authenticate.verifyUser ,(req,res,next) => {
    Promotions.findByIdAndUpdate(req.params.promoId,
        {
            $set:req.body
        },{
            new:true
        })
        .then((promotion)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(promotion);
        },(err)=>{
            next(err);
        }).catch((err)=>{
            next(err);
        });    
})
.delete(authenticate.verifyUser ,(req,res,next)=>{
    Promotions.findByIdAndRemove(req.params.promoId)
        .then((resp)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err)=>{
            next(err);
        }).catch((err)=>{
            next(err);
        });
});


module.exports = promotionRouter;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Dishes =require('../models/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());
//for / route.
dishRouter.route('/')
.get((req,res,next) => {
    Dishes.find({})
    .populate('comments.author')
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
    .post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
        Dishes.create(req.body)
        .then((dish)=>{
            console.log('Dish Created',dish);
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        },(err)=>{next(err)})
        .catch((err) => next(err));
    })
    .put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
        res.statusCode =403;
        res.end('Put operation not supported');
    })
    .delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
       Dishes.remove({})
       .then((resp)=>{
           res.statusCode =200;
           res.setHeader('Content-Type','application/json');
           res.json(resp);
       },(err)=>next(err))
       .catch((err)=>next(err));
    });
//for /dishid route
dishRouter.route('/:dishId')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
    .post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
         res.end('Post operation not supported');
     })
     .put(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
        Dishes.findByIdAndUpdate(req.params.dishId,{
            $set:req.body
        },{new:true})
        .then((dish)=>{
    
            res.statusCode =200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        },(err)=>{next(err)})
        .catch((err) => next(err));
        
     })
    .delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
       Dishes.findByIdAndRemove(req.params.dishId)
       .then((resp)=>{
        res.statusCode =200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
    });

// for /:dishId/comments route

dishRouter.route('/:dishId/comments')
.get((req,res,next) => {
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if (dish != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish);                
            }, (err) => next(err));
        }
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
    .put(authenticate.verifyUser,(req,res,next)=>{
        res.statusCode =403;
        res.end('Put operation not supported on /dishes/'+req.params.dishId+'/comments');
    })
    .delete(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
       Dishes.findById(req.params.dishId)
       .then((dish)=>{
        if(dish!=null){
          for(var i =(dish.comments.length-1);i>=0;i--){
              dish.comments.id(dish.comments[i]._id).remove();
          }
          dish.save()
            .then((dish) =>{
                res.stausCode =200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            },(err)=>{next(err)});
    
           }
          else {
            err = new Error('Dish'+req.params.dishID+'not found');
            err.status=404;
            return next(err)
          }
       },(err)=>next(err))
       .catch((err)=>next(err));
    });

//for  :dishId/comments/:commentId route

dishRouter.route('/:dishId/comments/:commentId')
    .get((req,res,next) => {
        Dishes.findById(req.params.dishId)
        .populate('comments.author')    
        .then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId) != null) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dish.comments.id(req.params.commentId));
            }
            else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);            
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
         res.end('Post operation not supported on /dishes/'+req.params.dishID+'/comments/'+req.params.commentId);
     })
     .put(authenticate.verifyUser,(req,res,next)=>{
        Dishes.findById(req.params.dishId)
        .then((dish)=>{
             if(dish!=null && dish.comments.id(req.params.commentId) != null)
              {
                var comment = dish.comments.id(req.params.commentId);
                if(JSON.stringify(req.user._id) === JSON.stringify(comment.author)){
                    if(req.body.rating){
                        dish.comments.id(req.params.commentId).rating=req.body.rating;
                      }
       
                      if(req.body.comment)
                      {
                       dish.comments.id(req.params.commentId).comment=req.body.comment;
                      }
                       dish.save()
                       .then((dish) =>{
                           res.stausCode =200;
                           res.setHeader('Content-Type','application/json');
                           res.json(dish);
                       },(err)=>{next(err)});
                }else{
                    err = new Error('you can not modify others comment' + req.params.commentId );
                    err.status = 403;
                    return next(err);
                }
              }
             else if(dish ==null){
               err = new Error('Dish'+req.params.dishID+'not found');
               err.status=404;
               return next(err);
             }
             else {
               err = new Error('Comment'+req.params.commentId+'not found');
               err.status=404;
               return next(err);
               }
            },(err)=>{next(err)})
        .catch((err) => next(err));
        
     })
    .delete(authenticate.verifyUser,(req,res,next)=>{
        Dishes.findById(req.params.dishId)
        .then((dish)=>{
         if(dish!=null && dish.comments.id(req.params.commentId) != null){
            var userComment= dish.comments.id(req.params.commentId)
            if(JSON.stringify(req.user._id) == JSON.stringify(userComment.author)){
                userComment.remove();
               dish.save()
                 .then((dish) =>{
                     res.stausCode =200;
                     res.setHeader('Content-Type','application/json');
                     res.json(dish);
                 },(err)=>{next(err)});
            }else{
                err = new Error('you can not delete others comment');
                err.status = 403;
                return next(err);
            }
            }
            else if(dish ==null){
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
              }
              else {
                err = new Error('Comment'+req.params.commentId+'not found');
                err.status=404;
                return next(err);
                }
        },(err)=>next(err))
    .catch((err)=>next(err));
    });
module.exports=dishRouter;
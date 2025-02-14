const express = require( 'express' );
const authMiddleware = require( '../middlewares/auth.middleware' );
const MessageController = require( '../controllers/message.controller' );

const router = express.Router();

// Protected routes
router.use( authMiddleware );

router.get( '/', MessageController.index );
router.get( '/:id', MessageController.show );
router.put( '/:id?', MessageController.update );
router.delete( '/:id', MessageController.delete );

module.exports = router;

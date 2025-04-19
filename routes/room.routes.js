const express = require( 'express' );
const authMiddleware = require( '../middlewares/auth.middleware' );
const RoomsController = require( '../controllers/room.controller' );

const router = express.Router();

// Protected routes
router.use( authMiddleware );

router.get( '/', RoomsController.index );
router.post( '/', RoomsController.store );
router.get( '/products/:product_id', RoomsController.getProductRooms );
router.get( '/:id', RoomsController.show );
router.put( '/:id', RoomsController.update );
router.delete( '/:id', RoomsController.delete );
router.get( '/:id/messages', RoomsController.getMessages );
router.get( '/:id/members', RoomsController.getMembers );
router.post( '/:id/members/add', RoomsController.addMembers );
router.post( '/:id/members/remove', RoomsController.removeMembers );

module.exports = router;

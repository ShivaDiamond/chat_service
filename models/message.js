const mongoose = require( 'mongoose' );

const MessageSchema = new mongoose.Schema(
{
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    sender_id: { type: String, required: true },
    content: { type: String, required: false, default: '' },
    attachments: [ { type: String } ]
}, { timestamps: true } );

module.exports = mongoose.model( 'Message', MessageSchema );

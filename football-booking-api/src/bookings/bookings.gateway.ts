import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
})
export class BookingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    // Emit khi có booking mới
    notifyNewBooking(booking: any) {
        this.server.emit('booking:new', booking);
    }

    // Emit khi booking được confirm/cancel
    notifyBookingUpdate(booking: any) {
        this.server.emit('booking:update', booking);
    }

    // Emit khi booking expired và bị auto-cancel
    notifyBookingExpired(bookingId: number) {
        this.server.emit('booking:expired', bookingId);
    }
}

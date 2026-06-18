import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast'; // Assuming you use react-hot-toast for notifications, or adjust to your UI library

export const useSocket = (userId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // 1. Initialize the connection to the NestJS backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const socketInstance = io(backendUrl);

    setSocket(socketInstance);

    // 2. Listen for the specific event we created in the backend
    socketInstance.on('ticket_updated', (data: { studentId: string, ticketId: string, status: string }) => {
      // 3. Ensure the student only gets notifications for THEIR tickets
      if (userId && data.studentId === userId) {
        toast.success(`Ticket Status Updated: ${data.status}`, {
          duration: 5000,
          position: 'top-right',
        });
        
        // Optional: If you use React Query or SWR, you would trigger a refetch here
        // e.g., mutate('/api/tickets/student')
      }
    });

    // 4. Cleanup the connection when the component unmounts
    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  return socket;
};
import { useMemo } from 'react';
import { calculatePrice } from './pricing';

const BookingsTable = ({ bookings }) => {
    const totalEarnings = useMemo(() => {
        return bookings.reduce((acc, booking) => acc + calculatePrice(booking), 0);
    }, [bookings]);

    return (
        <div>
            <h2>Total Earnings: ${totalEarnings.toFixed(2)}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Price Breakdown</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking) => (
                        <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>${calculatePrice(booking).toFixed(2)} - {booking.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BookingsTable;
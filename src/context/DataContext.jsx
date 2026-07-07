import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [transactions, setTransactions] = useState([]);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/rooms`, { cache: 'no-store' });
      if (res.ok) setRooms(await res.json());
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/bookings`, { cache: 'no-store' });
      if (res.ok) setBookings(await res.json());
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_URL}/transactions`, { cache: 'no-store' });
      if (res.ok) setTransactions(await res.json());
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchBookings();
    fetchTransactions();
  }, []);

  const addTransaction = async (transactionData) => {
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      if (res.ok) fetchTransactions();
    } catch (error) {
      console.error('Failed to add transaction', error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTransactions();
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  const addRoom = async (roomData) => {
    try {
      const isFormData = roomData instanceof FormData;
      const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? roomData : JSON.stringify(roomData)
      });
      if (res.ok) fetchRooms();
    } catch (error) {
      console.error('Failed to add room', error);
    }
  };

  const deleteRoom = async (id) => {
    try {
      const res = await fetch(`${API_URL}/rooms/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRooms();
    } catch (error) {
      console.error('Failed to delete room', error);
    }
  };

  const addBooking = async (bookingData) => {
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        fetchBookings();
        fetchRooms();
      }
    } catch (error) {
      console.error('Failed to add booking', error);
    }
  };

  const updateBookingStatus = async (id, status, dates = null) => {
    try {
      const body = { status };
      if (dates) {
        body.start_date = dates.start_date;
        body.end_date = dates.end_date;
      }
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        fetchBookings();
        fetchRooms();
        if (status === 'Selesai') fetchTransactions(); // Refresh transactions automatically when a booking is accepted
      }
    } catch (error) {
      console.error('Failed to update booking', error);
    }
  };

  const deleteBooking = async (id) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBookings();
        fetchRooms();
      }
    } catch (error) {
      console.error('Failed to delete booking', error);
    }
  };

  const updateUserName = async (userId, newName) => {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to update user name', error);
    }
  };

  return (
    <DataContext.Provider value={{ 
      rooms, addRoom, deleteRoom, 
      bookings, addBooking, updateBookingStatus, deleteBooking, updateUserName,
      transactions, addTransaction, deleteTransaction, fetchTransactions,
      refreshData: () => { fetchRooms(); fetchBookings(); fetchTransactions(); }
    }}>
      {children}
    </DataContext.Provider>
  );
};

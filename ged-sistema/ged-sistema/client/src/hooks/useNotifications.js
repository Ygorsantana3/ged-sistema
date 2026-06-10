import { useState, useEffect } from 'react';
import api from '../services/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = () => {
    api.get('/notifications')
      .then(r => {
        setNotifications(r.data);
        setUnreadCount(r.data.filter(n => !n.lida).length);
      })
      .catch(() => {});
  };

  useEffect(() => { load(); const interval = setInterval(load, 60000); return () => clearInterval(interval); }, []);

  const markAsRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  return { notifications, unreadCount, markAsRead, refresh: load };
}

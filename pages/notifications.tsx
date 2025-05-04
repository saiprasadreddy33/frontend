import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', 'user1')
      .order('created_at', { ascending: false });

    if (error) {
      alert('Failed to fetch notifications');
      console.error(error);
    } else {
      setNotifications(data);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Notifications for user1</h2>
      <ul>
        {notifications.map((n) => (
          <li key={n.id} style={{ marginBottom: 12 }}>
            {n.message} <br />
            <small>{new Date(n.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

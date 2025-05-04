import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBell } from 'react-icons/fa';
import { supabase } from '../lib/supabaseClient';
export default function Home() {
  const [type, setType] = useState('follow');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  type Notification = {
    id: string;
    message: string;
    created_at: string;
  };
  
  
  const fetchNotifications = async () => {
    const res = await axios.get<Notification[]>('https://backend-insyd.onrender.com/notifications/user1');
    setNotifications(res.data);
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.user1' },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const trigger = async () => {
    await axios.post('https://backend-insyd.onrender.com/notifications', {
      userId: 'user1',
      actorId: 'actor1',
      type,
    });
  };


  return (
    <div style={{ padding: 24, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Trigger a Notification</h2>

        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowDropdown(!showDropdown)}>
          <FaBell size={24} />
          {notifications.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: 'red',
                color: 'white',
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: '50%',
              }}
            >
              {notifications.length}
            </span>
          )}

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: 4,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                width: 250,
                zIndex: 10,
              }}
            >
              <ul style={{ listStyle: 'none', margin: 0, padding: 10 }}>
                {notifications.slice(0, 5).map((n) => (
                  <li key={n.id} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                    <div>{n.message}</div>
                    <small style={{ color: '#999' }}>{new Date(n.created_at).toLocaleString()}</small>
                  </li>
                ))}
                {notifications.length === 0 && <li>No notifications</li>}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <select onChange={(e) => setType(e.target.value)} value={type}>
          <option value="follow">Follow</option>
          <option value="post">Post</option>
          <option value="like">Like</option>
        </select>
        <button onClick={trigger} style={{ marginLeft: 12 }}>
          Send
        </button>
      </div>
    </div>
  );
}

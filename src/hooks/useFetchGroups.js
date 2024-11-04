// hooks/useFetchGroups.js
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import GroupAPI from '../apis/group_api';

export default function useFetchGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Select `currentUser` and rehydration state separately
  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!currentUser || !currentUser.user?.id) {
        console.log('Current user id is not available');
        return;
      }

      try {
        setLoading(true);
        const response = await GroupAPI.getGroupsForUser(currentUser.user.id);
        setGroups(response.result || []); // Ensure it's an array
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]); // Fallback to an empty array in case of error
      } finally {
        setLoading(false);
      }
    };

    // Only run after rehydration and when currentUser is available
    if (rehydrated && currentUser) {
      fetchGroups();
    }
  }, [currentUser, rehydrated]);

  return { groups, loading };
}

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export default function useFirestoreCollection(collectionName, filters = []) {
  const filterKey = JSON.stringify(filters);
  const constraints = useMemo(
    () => filters.map(({ field, operator, value }) => where(field, operator, value)),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [filterKey]
  );
  const subscriptionKey = `${collectionName}:${filterKey}`;
  const [snapshotState, setSnapshotState] = useState({
    key: null,
    documents: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const reference = collection(db, collectionName);
    const target = constraints.length ? query(reference, ...constraints) : reference;

    const timeout = setTimeout(() => {
      setSnapshotState((prev) => (prev.loading ? { ...prev, loading: false } : prev));
    }, 1500);

    const unsubscribe = onSnapshot(
      target,
      (snapshot) => {
        clearTimeout(timeout);
        setSnapshotState({
          key: subscriptionKey,
          documents: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
          loading: false,
          error: null,
        });
      },
      (snapshotError) => {
        clearTimeout(timeout);
        console.warn(`Firestore subscription note for ${collectionName}:`, snapshotError.message);
        setSnapshotState({
          key: subscriptionKey,
          documents: [],
          loading: false,
          error: snapshotError,
        });
      }
    );

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [collectionName, constraints, subscriptionKey]);

  if (snapshotState.key !== subscriptionKey) {
    return { documents: [], loading: true, error: null };
  }
  return snapshotState;
}


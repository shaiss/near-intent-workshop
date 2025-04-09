import { useState, useEffect } from 'react';
import ContentService from '../../services/ContentService';

// This hook can be used by components that need the workshop structure
export function useWorkshopStructure() {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStructure() {
      try {
        const data = await ContentService.getWorkshopStructure();
        setStructure(data);
      } catch (err) {
        console.error("Error loading workshop structure:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadStructure();
  }, []);

  return { structure, loading, error };
}

// For backward compatibility with any components that expect the structure directly
const WorkshopStructure = () => {
  const { structure, loading } = useWorkshopStructure();

  if (loading) {
    return <div>Loading workshop structure...</div>;
  }

  return (
    <div>
      <h1>{structure?.title}</h1>
      <p>{structure?.description}</p>
    </div>
  );
};

export default WorkshopStructure;
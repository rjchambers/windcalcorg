import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PECredentials = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/settings?tab=seal', { replace: true }); }, [navigate]);
  return null;
};

export default PECredentials;

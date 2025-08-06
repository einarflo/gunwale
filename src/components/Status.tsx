import React from 'react';

interface StatusProps {
  loading?: boolean;
  error?: boolean;
}

const Status: React.FC<StatusProps> = ({ loading, error }) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>An error has occurred...</div>;
  }

  return null;
};

export default Status;

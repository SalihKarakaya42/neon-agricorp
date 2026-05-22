import React from 'react';

interface ResourceDisplayProps {
  label: string;
  value: number;
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ label, value }) => {
  // Apply cyberpunk styling for resources
  const getStyle = () => {
    let color = '#00ffff'; // Default: Neon Cyan
    if (label === 'Credits') {
      color = '#ff00ff'; // Neon Pink for currency
    } else if (label === 'Water' || label === 'Energy') {
      // Color based on low level (optional, can be added later)
    }
    
    return {
      color: color,
      textShadow: `0 0 5px ${color}`,
      margin: '10px',
      padding: '5px',
      border: `1px solid ${color}`,
      display: 'inline-block',
      minWidth: '150px',
    };
  };

  return (
    <div style={getStyle()}>
      <strong>{label}:</strong> {Math.round(value)}
    </div>
  );
};

export default ResourceDisplay;

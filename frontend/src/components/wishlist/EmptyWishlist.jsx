import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { EmptyState } from '../common';

function EmptyWishlist() {
  const navigate = useNavigate();

  return (
    <EmptyState
      title="Your wishlist is empty"
      message="Explore and add items to your wishlist to keep track of products you love."
      actionText="Explore Products"
      onAction={() => navigate('/')}
      icon={FiHeart}
    />
  );
}

export default EmptyWishlist;

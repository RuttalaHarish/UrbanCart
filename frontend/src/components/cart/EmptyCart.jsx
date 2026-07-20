import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { EmptyState } from '../common';

function EmptyCart() {
  const navigate = useNavigate();

  return (
    <EmptyState
      title="Your cart is empty"
      message="Looks like you haven't added anything to your cart yet. Let's find some premium items."
      actionText="Continue Shopping"
      onAction={() => navigate('/')}
      icon={FiShoppingCart}
    />
  );
}

export default EmptyCart;

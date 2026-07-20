import './QuantitySelector.css';

function QuantitySelector({ quantity, stock, onChange }) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < stock) {
      onChange(quantity + 1);
    }
  };

  return (
    <div className="quantity-selector">
      <button
        type="button"
        className="quantity-selector-btn"
        onClick={handleDecrement}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className="quantity-selector-value">{quantity}</span>
      <button
        type="button"
        className="quantity-selector-btn"
        onClick={handleIncrement}
        disabled={quantity >= stock}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default QuantitySelector;

function Container({ children, className = '', fluid = false }) {
  const containerClass = `container${fluid ? '-fluid' : ''} ${className}`.trim();
  return <div className={containerClass}>{children}</div>;
}

export default Container;

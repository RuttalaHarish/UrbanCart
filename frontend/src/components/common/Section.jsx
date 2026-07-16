function Section({ children, className = '', bgType = 'default' }) {
  const sectionClass = `section section-bg-${bgType} ${className}`.trim();
  return <section className={sectionClass}>{children}</section>;
}

export default Section;

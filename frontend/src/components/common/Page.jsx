import { useEffect } from 'react';

function Page({ children, title = '' }) {
  useEffect(() => {
    document.title = title ? `${title} | UrbanCart` : 'UrbanCart';
  }, [title]);

  return <div className="page-fade-in">{children}</div>;
}

export default Page;
